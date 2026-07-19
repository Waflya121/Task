import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration, { AppConfig } from './config/configuration';
import { validationSchema } from './config/validation';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: { abortEarly: false },
    }),
    ThrottlerModule.forRoot([
      // Глобальный лимит по умолчанию: 100 запросов в минуту.
      { ttl: 60_000, limit: 100 },
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const db = configService.get('database', { infer: true });
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.user,
          password: db.password,
          database: db.name,
          entities: [User],
          migrations: ['dist/migrations/*.js'],
          // Автосинхронизация всегда выключена — используем миграции.
          synchronize: false,
        };
      },
    }),
    AuthModule,
    UsersModule,
    MailModule,
  ],
  providers: [
    // Глобальный guard rate-limiting.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
