import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Некорректный email' })
  email!: string;

  @ApiProperty({ example: 'Passw0rd!' })
  @IsString()
  @MinLength(1, { message: 'Пароль обязателен' })
  password!: string;
}
