import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { ResendConfirmationDto } from './dto/resend-confirmation.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Ограничение для регистрации: 10 запросов за 5 минут с одного IP.
  @Throttle({ default: { limit: 10, ttl: 300_000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Регистрация (сразу выдаёт JWT, авто-вход)' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход по email и паролю' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Подтверждение email по токену' })
  @ApiOkResponse({
    schema: {
      example: { message: 'Email успешно подтверждён', confirmed: true },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid or expired token' })
  async confirm(
    @Body() dto: ConfirmEmailDto,
  ): Promise<{ message: string; confirmed: true }> {
    return this.authService.confirmEmail(dto.token);
  }

  @Post('resend-confirmation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Повторная отправка письма подтверждения' })
  @ApiOkResponse({ schema: { example: { message: 'string' } } })
  async resendConfirmation(
    @Body() dto: ResendConfirmationDto,
  ): Promise<{ message: string }> {
    return this.authService.resendConfirmation(dto.email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Запрос на сброс пароля' })
  @ApiOkResponse({ schema: { example: { message: 'string' } } })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Установка нового пароля по токену' })
  @ApiOkResponse({ schema: { example: { message: 'string' } } })
  @ApiBadRequestResponse({ description: 'Invalid or expired token' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(dto.token, dto.password);
  }
}
