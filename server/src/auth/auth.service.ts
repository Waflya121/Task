import { randomBytes } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 час

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  private signToken(user: User): string {
    // Полезная нагрузка JWT: { sub, email }.
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }

  private buildAuthResponse(user: User): AuthResponseDto {
    return new AuthResponseDto(this.signToken(user), new UserResponseDto(user));
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        'Пользователь с таким email уже зарегистрирован',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const confirmationToken = this.generateToken();

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName ?? null,
      confirmationToken,
    });

    // Письмо отправляем в фоне и не ждём его: SMTP может быть недоступен или
    // медленным (особенно с плейсхолдер-данными в dev), а регистрация не
    // должна зависать из-за этого — ошибки отправки MailService ловит сам.
    void this.mailService.sendWelcomeEmail(
      user.email,
      user.firstName,
      confirmationToken,
    );

    // Регистрация сразу выдаёт JWT (авто-вход). Подтверждение email — это
    // отдельный флаг статуса, а не барьер для входа в систему.
    return this.buildAuthResponse(user);
  }

  // Используется LocalStrategy и login(). Возвращает null при любой ошибке,
  // чтобы не раскрывать, существует ли email.
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    const matches = await bcrypt.compare(password, user.passwordHash);
    return matches ? user : null;
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      // Общее сообщение — не раскрываем, существует ли пользователь.
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildAuthResponse(user);
  }

  async confirmEmail(
    token: string,
  ): Promise<{ message: string; confirmed: true }> {
    const user = await this.usersService.findByConfirmationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }
    user.isEmailConfirmed = true;
    user.confirmationToken = null;
    await this.usersService.save(user);
    return { message: 'Email успешно подтверждён', confirmed: true };
  }

  async resendConfirmation(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    // Отправляем письмо только если пользователь есть и ещё не подтверждён,
    // но ответ всегда одинаковый — защита от перечисления пользователей.
    if (user && !user.isEmailConfirmed) {
      const confirmationToken = this.generateToken();
      user.confirmationToken = confirmationToken;
      await this.usersService.save(user);
      void this.mailService.sendWelcomeEmail(
        user.email,
        user.firstName,
        confirmationToken,
      );
    }
    return {
      message:
        'Если аккаунт существует и не подтверждён, письмо было отправлено повторно',
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    // Ответ всегда одинаковый вне зависимости от существования email —
    // предотвращаем перечисление пользователей.
    if (user) {
      const resetPasswordToken = this.generateToken();
      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await this.usersService.save(user);
      void this.mailService.sendResetPasswordEmail(
        user.email,
        user.firstName,
        resetPasswordToken,
      );
    }
    return {
      message: 'Если аккаунт существует, письмо для сброса пароля отправлено',
    };
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByValidResetToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }
    user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.usersService.save(user);
    return { message: 'Пароль успешно изменён' };
  }
}
