import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Полезная нагрузка JWT, которую JwtStrategy кладёт в request.user.
export interface JwtUser {
  userId: string;
  email: string;
}

// Достаёт валидированного пользователя из JWT-запроса: @GetUser() или @GetUser('email').
export const GetUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext): JwtUser | string => {
    const request = ctx.switchToHttp().getRequest<Request & { user: JwtUser }>();
    const user = request.user;
    return data ? user[data] : user;
  },
);
