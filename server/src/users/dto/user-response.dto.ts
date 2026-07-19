import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

// Публичное представление пользователя. Никогда не содержит passwordHash и токены.
export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Иван' })
  firstName: string;

  @ApiProperty({ example: 'Иванов', nullable: true, type: String })
  lastName: string | null;

  @ApiProperty({ example: false })
  isEmailConfirmed: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.isEmailConfirmed = user.isEmailConfirmed;
    this.createdAt = user.createdAt.toISOString();
  }
}
