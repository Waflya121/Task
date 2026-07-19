import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Иван', minLength: 2 })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Иванов' })
  @IsOptional()
  @IsString()
  lastName?: string;
}
