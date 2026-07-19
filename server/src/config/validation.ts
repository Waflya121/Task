import * as Joi from 'joi';

// Схема валидации переменных окружения. Выполняется при старте приложения:
// если чего-то обязательного не хватает — Nest падает с понятной ошибкой (fail fast).
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5000),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  JWT_SECRET: Joi.string().min(8).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  // UniSender HTTP API вместо SMTP — SMTP-порты блокированы почти на всех
  // бюджетных хостингах, HTTPS-запросы к API такие блокировки не встречают.
  UNISENDER_API_KEY: Joi.string().required(),
  UNISENDER_LIST_ID: Joi.string().required(),
  SENDER_EMAIL: Joi.string().email().default('no-reply@example.com'),
  SENDER_NAME: Joi.string().default('Nova'),
});
