import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService<AppConfig, true>);

  const port = configService.get('port', { infer: true });
  const frontendUrl = configService.get('frontendUrl', { infer: true });
  const serviceName = configService.get('serviceName', { infer: true });

  // За реверс-прокси (Nginx на том же хосте) доверяем первому хопу, иначе
  // Express видит все запросы как идущие с 127.0.0.1, и rate-limiting
  // (ThrottlerGuard) считает всех пользователей одним IP.
  app.set('trust proxy', 1);

  // Безопасные HTTP-заголовки.
  app.use(helmet());

  // CORS только для фронтенда, с поддержкой куки/credentials.
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // Глобальная валидация всех DTO.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Единый формат ошибок и логирование каждого запроса.
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger UI доступен по /api/docs (единственный маршрут под /api).
  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${serviceName} Auth API`)
    .setDescription(`REST API аутентификации сервиса ${serviceName}`)
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  new Logger('Bootstrap').log(
    `${serviceName} server запущен на порту ${port} (docs: /api/docs)`,
  );
}

void bootstrap();
