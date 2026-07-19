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

  // SMTP через relay NetAngels (skvmrelay.netangels.ru) — на VDS "Старт"
  // прямые исходящие SMTP-порты заблокированы, но этот relay-сервер
  // разрешён самим хостером именно для таких случаев.
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(25),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASS: Joi.string().allow('').default(''),
  MAIL_FROM: Joi.string().default('Nova <noreply@nova1-app.ru>'),
});
