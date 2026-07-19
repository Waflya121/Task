import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser, JwtUser } from '../common/decorators/get-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Требуется валидный JWT' })
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiOkResponse({ type: UserResponseDto })
  async getMe(@GetUser() user: JwtUser): Promise<UserResponseDto> {
    const entity = await this.usersService.getByIdOrThrow(user.userId);
    return new UserResponseDto(entity);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Обновить профиль текущего пользователя' })
  @ApiOkResponse({ type: UserResponseDto })
  async updateMe(
    @GetUser() user: JwtUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const entity = await this.usersService.update(user.userId, dto);
    return new UserResponseDto(entity);
  }
}
