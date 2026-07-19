import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ConfirmEmailDto {
  @ApiProperty({ example: 'a1b2c3d4e5...' })
  @IsString()
  @MinLength(1, { message: 'Токен обязателен' })
  token!: string;
}
