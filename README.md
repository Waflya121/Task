# Nova — регистрация через email + личный кабинет

Полноценное веб-приложение: React 18 + TypeScript клиент и NestJS + TypeScript сервер с
регистрацией/входом по email и паролю, подтверждением email по ссылке, восстановлением
пароля и личным кабинетом.

```
Задание/
├── client/   React + TypeScript + Vite + Tailwind (порт 3000)
└── server/   NestJS + TypeScript + TypeORM + PostgreSQL (порт 5000)
```

## Стек

**Клиент:** React 18, TypeScript, Vite, React Router v6, Axios, Tailwind CSS,
React Hook Form + Zod, Framer Motion, react-hot-toast.

**Сервер:** NestJS, TypeORM, PostgreSQL, JWT (passport-jwt), bcrypt, Nodemailer
(SMTP + Handlebars-шаблоны), class-validator, @nestjs/throttler, helmet, Swagger.

## Требования

- Node.js 18+ и npm
- PostgreSQL 16 (или Docker, чтобы поднять его одной командой)
- SMTP-аккаунт для отправки писем (Gmail + [App Password](https://support.google.com/accounts/answer/185833),
  либо Mailtrap/Ethereal для локальной разработки без реальной доставки)

## Быстрый запуск

### 1. Установить зависимости

```bash
npm run install:all
```

Устанавливает зависимости в `server/` и `client/`. Также один раз выполните
`npm install` в корне (`Задание/`), чтобы получить `concurrently`, используемый
скриптом `npm run dev`.

### 2. Настроить переменные окружения

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

В `server/.env` укажите реальные данные PostgreSQL и SMTP. Для Gmail `SMTP_PASS`
должен быть [App Password](https://support.google.com/accounts/answer/185833), а не
обычный пароль аккаунта (нужно включить двухэтапную аутентификацию, затем создать
пароль на [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
`MAIL_FROM` должен совпадать со `SMTP_USER` — иначе Gmail отклоняет письмо или
молча подменяет обратный адрес.

**Важно:** локально всё работает на любом плане. На Render же бесплатный план
блокирует исходящие SMTP-порты (465/587) как защиту от спама — для реальной
отправки писем с задеплоенного сервера нужен как минимум план **Starter**
($7/мес), на нём порты открыты (см. раздел «Деплой» ниже).

### 3. Поднять PostgreSQL

Через Docker (проще всего):

```bash
npm run db:up
```

Поднимет `postgres:16` с параметрами из `server/.env` (см. `server/docker-compose.yml`).
Либо используйте свой локальный PostgreSQL — просто пропишите его данные в `server/.env`.

### 4. Прогнать миграции

```bash
npm run migration:run
```

Создаст таблицу `users` (уникальный индекс на `email` и т.д.) — структура БД никогда
не создаётся через `synchronize`, только через миграции TypeORM.

### 5. Запустить оба проекта одновременно

```bash
npm run dev
```

- Клиент: http://localhost:3000
- Сервер: http://localhost:5000
- Swagger-документация API: http://localhost:5000/api/docs

Запустить по отдельности можно через `npm run start:server` / `npm run start:client`.

### Сборка для продакшена

```bash
npm run build
```

Собирает `server/dist` и `client/dist`. Запуск собранного сервера:
`npm run start:prod --prefix server` (перед первым запуском в чистом окружении
выполните `npm rebuild bcrypt` внутри `server/`, если ставили зависимости без
postinstall-скриптов).

### Если письма не приходят

Отправка письма при регистрации не блокирует ответ API (выполняется в фоне) —
ошибки отправки не ломают регистрацию, а логируются как предупреждение
(`MailService`) в логах сервера. Если письмо не пришло, первым делом смотрите
именно туда.

Важно: на **бесплатном** плане Render исходящие SMTP-порты (465/587)
заблокированы как защита от спама — попытка подключения будет падать по
таймауту независимо от правильности данных. Это ограничение сети хостинга,
не баг кода. На плане **Starter** и выше порты открыты, письма отправляются
нормально — см. [changelog Render](https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports).
Локально работает на любом плане.

## Как это работает

1. Пользователь регистрируется на `/register` (имя, email, пароль, подтверждение
   пароля) → сервер создаёт аккаунт, сразу выдаёт JWT (авто-вход) и отправляет письмо
   с темой «Добро пожаловать в Nova!» и ссылкой подтверждения
   `http://localhost:3000/confirm?token=...`.
2. Клиент сохраняет сессию и переходит на `/confirm` — там показывается статус
   («письмо отправлено» / после перехода по ссылке — «email подтверждён», редирект в
   `/dashboard` через 3 секунды).
3. Вход на `/login` по email + паролю, есть «Забыли пароль?» → `/forgot-password` →
   письмо со ссылкой `/reset-password?token=...`.
4. `/dashboard` — защищённый маршрут, показывает **«Hello world! Добро пожаловать,
   [Имя]!»**, карточку профиля (аватар-инициалы, email, дата регистрации, статус
   подтверждения email) и кнопку «Выйти».

## API (кратко)

| Метод | Путь                        | Описание                              | Auth |
|-------|-----------------------------|----------------------------------------|------|
| POST  | `/auth/register`            | Регистрация, авто-вход (JWT)           | —    |
| POST  | `/auth/login`                | Вход                                    | —    |
| POST  | `/auth/confirm`              | Подтверждение email по токену           | —    |
| POST  | `/auth/resend-confirmation`  | Повторная отправка письма               | —    |
| POST  | `/auth/forgot-password`      | Запрос сброса пароля                    | —    |
| POST  | `/auth/reset-password`       | Установка нового пароля по токену       | —    |
| GET   | `/users/me`                  | Профиль текущего пользователя           | JWT  |
| PATCH | `/users/me`                  | Обновление имени/фамилии                | JWT  |

Полная интерактивная документация — Swagger: http://localhost:5000/api/docs.
Готовая коллекция для ручного тестирования — `postman_collection.json` в корне репозитория
(импортируется в Postman, переменные `baseUrl` и `accessToken` настроены заранее,
токен из ответа `/auth/login` или `/auth/register` подставляется автоматически).

## Структура проекта

Полная структура файлов клиента и сервера описана в комментариях внутри каждого
проекта; кратко:

```
client/src/
├── components/{auth,common,dashboard}/
├── pages/            HomePage, RegisterPage, LoginPage, DashboardPage,
│                     ConfirmEmailPage, ForgotPasswordPage, ResetPasswordPage
├── hooks/            useAuth, useFormValidation
├── context/          AuthContext (сессия, remember-me)
├── services/         api.ts (axios + JWT-интерсептор)
├── types/, utils/    типы и Zod-схемы валидации

server/src/
├── auth/             контроллер, сервис, DTO, JWT/local стратегии
├── users/             контроллер, сервис, entity User
├── mail/              Nodemailer (SMTP) + Handlebars-шаблоны писем
├── common/            guards, decorators, exception filter, logging interceptor
├── config/            типизированная конфигурация + Joi-валидация env
└── migrations/         миграции TypeORM (таблица users)
```

## Деплой на Render (публичная ссылка)

В репозитории есть `render.yaml` — blueprint, который поднимает всё нужное одним
деплоем: PostgreSQL, backend (Node web-сервис) и frontend (статическая сборка Vite).

1. Зарегистрируйтесь на [render.com](https://render.com) (бесплатно, через GitHub).
2. **New → Blueprint** → выберите этот репозиторий (`Waflya121/Task`) → Render
   найдёт `render.yaml` и предложит создать 3 ресурса: `nova-db`, `nova-server`,
   `nova-client`. Подтвердите — начнётся первый деплой (может занять 5–10 минут:
   у бесплатного плана Node-сервисы поднимаются не мгновенно).
3. После того как **`nova-server`** задеплоится, скопируйте его URL (вида
   `https://nova-server-xxxx.onrender.com`).
4. После того как **`nova-client`** задеплоится, скопируйте его URL (вида
   `https://nova-client-xxxx.onrender.com`).
5. В дашборде Render зайдите в **nova-server → Environment** и заполните:
   - `FRONTEND_URL` = URL из шага 4
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` — как в
     `server/.env.example`.

   Затем зайдите в **nova-client → Environment** и заполните:
   - `VITE_API_URL` = URL из шага 3

   **Важно про почту:** `render.yaml` уже поднимает `nova-server` на платном
   плане **Starter** ($7/мес) — это необходимо, чтобы вообще открылись
   исходящие SMTP-порты (на бесплатном плане Render их блокирует, независимо
   от правильности SMTP-данных). Если сервис уже был создан раньше на
   бесплатном плане, поменяйте план вручную: **nova-server → Settings →
   Instance Type**.

6. Нажмите **Manual Deploy → Deploy latest commit** на обоих сервисах, чтобы
   применились новые переменные (для статического сайта `VITE_API_URL` должен
   попасть в сборку, поэтому фронт обязательно нужно пересобрать после того как
   переменная задана — недостаточно просто перезапустить).
7. Готово — `nova-client`-ссылка и есть публичный сайт.

Бесплатный план Render "усыпляет" неактивные сервисы — первый запрос после
простоя может обрабатываться 30–60 секунд, пока сервис поднимается. Free
PostgreSQL на Render также ограничен по времени жизни (см. условия Render) —
для долгосрочного использования потребуется платный план либо переезд на другую
управляемую БД (Supabase/Neon).

## Известные особенности

- Регистрация выдаёт JWT сразу (пользователь считается вошедшим), а
  `isEmailConfirmed` — отдельный статус-флаг, а не блокировка входа.
- Пароль: минимум 8 символов, минимум одна заглавная буква, одна цифра и один
  спецсимвол — проверяется одинаково и на клиенте (Zod), и на сервере
  (`class-validator`).
- `forgot-password` всегда отвечает одинаково (не раскрывает, существует ли email).
- Регистрация ограничена rate-limit'ом: 10 запросов / 5 минут с одного IP.
