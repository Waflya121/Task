import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

// Регулярка проверяет минимум 1 заглавную букву, 1 цифру и 1 спецсимвол.
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;
const PASSWORD_MESSAGE =
  'Пароль должен содержать минимум 8 символов, хотя бы одну заглавную букву, одну цифру и один спецсимвол';

export class RegisterDto {
  @ApiProperty({ example: 'Иван', minLength: 2 })
  @IsString()
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  firstName!: string;

  @ApiPropertyOptional({ example: 'Иванов' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Некорректный email' })
  email!: string;

  @ApiProperty({ example: 'Passw0rd!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password!: string;
}
