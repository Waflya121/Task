import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string | null;
  confirmationToken: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(data: CreateUserData): Promise<User> {
    const user = this.usersRepository.create({
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      confirmationToken: data.confirmationToken,
      isEmailConfirmed: false,
    });
    return this.usersRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByConfirmationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { confirmationToken: token } });
  }

  // Ищем пользователя по токену сброса, у которого срок действия ещё не истёк.
  async findByValidResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async getByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.getByIdOrThrow(id);
    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName;
    }
    return this.usersRepository.save(user);
  }
}
