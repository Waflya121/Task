import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;
const PASSWORD_MESSAGE =
  'Пароль должен содержать минимум 8 символов, хотя бы одну заглавную букву, одну цифру и один спецсимвол';

export class ResetPasswordDto {
  @ApiProperty({ example: 'a1b2c3d4e5...' })
  @IsString()
  @MinLength(1, { message: 'Токен обязателен' })
  token!: string;

  @ApiProperty({ example: 'NewPassw0rd!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password!: string;
}
