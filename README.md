# Nova — регистрация через email + личный кабинет

Полноценное веб-приложение: React 18 + TypeScript клиент и NestJS + TypeScript сервер с
регистрацией/входом по email и паролю, подтверждением email по ссылке, восстановлением
пароля и личным кабинетом.

**Живая версия:** https://vm-3ce7d67c.na4u.ru (VPS, настоящий HTTPS-сертификат
Let's Encrypt; про отправку почты см. раздел «Деплой на VPS» про UniSender).

```
Задание/
├── client/   React + TypeScript + Vite + Tailwind (порт 3000)
└── server/   NestJS + TypeScript + TypeORM + PostgreSQL (порт 5000)
```

## Стек

**Клиент:** React 18, TypeScript, Vite, React Router v6, Axios, Tailwind CSS,
React Hook Form + Zod, Framer Motion, react-hot-toast.

**Сервер:** NestJS, TypeORM, PostgreSQL, JWT (passport-jwt), bcrypt, UniSender
(HTTP API + Handlebars-шаблоны), class-validator, @nestjs/throttler, helmet, Swagger.

## Требования

- Node.js 18+ и npm
- PostgreSQL 16 (или Docker, чтобы поднять его одной командой)
- Аккаунт [UniSender](https://unisender.com) с верифицированным доменом-отправителем
  для отправки писем — см. ниже

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

В `server/.env` укажите реальные данные PostgreSQL и почты. Письма отправляются
через HTTP API [UniSender](https://unisender.com), а не через SMTP: SMTP-порты
блокируются практически на всех бюджетных хостингах (проверено и на Render, и
на обычном VPS) как защита от спама, а HTTPS-запросы к API такие блокировки не
встречают.

1. Зарегистрируйтесь на [unisender.com](https://unisender.com).
2. Верифицируйте домен-отправитель: **Настройки → Домены** — добавьте домен и
   пропишите выданные SPF/DKIM-записи в DNS этого домена (у своего регистратора).
   Без верификации домена UniSender откажется отправлять письма на чужие адреса
   (ответит `"Use your custom domain email with authentication"`).
3. Создайте API-ключ и впишите в `UNISENDER_API_KEY`.
4. `SENDER_EMAIL` — адрес на верифицированном домене (например, `no-reply@your-domain.ru`).
5. `UNISENDER_LIST_ID` — ID любого списка контактов в аккаунте (классический
   API UniSender требует list_id даже для одиночных писем).

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

Если письмо не приходит совсем — проверьте, что `SENDER_EMAIL` действительно
верифицирован в UniSender как отправитель на подтверждённом домене (Settings →
Domains). Неверифицированный адрес UniSender отклоняет сразу с понятной
ошибкой в логе.

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
├── mail/              UniSender (HTTP API) + Handlebars-шаблоны писем
├── common/            guards, decorators, exception filter, logging interceptor
├── config/            типизированная конфигурация + Joi-валидация env
└── migrations/         миграции TypeORM (таблица users)
```

## Деплой на VPS (текущий вариант, публичная ссылка)

Приложение развёрнуто на обычном VPS (Ubuntu 24.04), где фронтенд и бэкенд
живут **на одном origin** через один Nginx — так проще всего избежать проблемы
mixed content (браузеры блокируют запросы с HTTPS-страницы на HTTP-адрес, а без
своего домена+TLS получить HTTPS для бэкенда нельзя; на одном origin эта
проблема просто не возникает).

Схема:

```
Nginx (порт 80)
├── /            → статика client/dist (собран `vite build`, SPA fallback на index.html)
├── /auth/*      → proxy_pass на Node-сервер (127.0.0.1:5000)
├── /users/*     → proxy_pass на Node-сервер
└── /api/*       → proxy_pass на Node-сервер (Swagger)

Node-сервер (nova-server.service, systemd) — 127.0.0.1:5000
PostgreSQL (локально на том же сервере)
```

Ключевые моменты настройки:

- Клиент собирается с `VITE_API_URL=` (пустая строка) — все запросы идут
  относительным путём на тот же origin, что и сама страница.
- `server/src/main.ts` вызывает `app.set('trust proxy', 1)` — иначе за Nginx
  Express видел бы все запросы с одного IP (127.0.0.1), и rate-limiting
  (`ThrottlerGuard`) считал бы всех пользователей одним клиентом.
- Backend запускается как systemd-сервис (`/etc/systemd/system/nova-server.service`,
  `User=nova`, `Restart=always`), логи пишутся в файл (`/var/log/nova-server.log`) —
  на некоторых образах Ubuntu journald не сохраняет журналы (`journalctl`
  показывает "No journal files were found"), файл-лог работает всегда.
- Каталог с собранным клиентом должен быть доступен на чтение пользователю
  Nginx (`www-data`): если домашняя папка системного пользователя приложения
  создана с правами `750` (по умолчанию для `useradd --system`), Nginx получит
  `500 Internal Server Error` — нужно `chmod o+x` на родительский каталог.
- `prebuild` в `server/package.json` чистит и `dist`, и `tsconfig.tsbuildinfo` —
  без этого `tsc` в некоторых случаях считает часть файлов "неизменными" по
  старому кэшу и не записывает их в свежесобранный `dist`, из-за чего сервер
  падает на старте с `Cannot find module './app.module'`.

### Развёртывание на новом VPS с нуля (кратко)

```bash
# Node.js 20 LTS, PostgreSQL, Nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs postgresql nginx git

# База данных
sudo -u postgres createuser --login --pwprompt nova_user
sudo -u postgres createdb -O nova_user nova_db

# Код
git clone https://github.com/Waflya121/Task.git /opt/app
cd /opt/app/server && cp .env.example .env   # заполнить реальными значениями
npm install --include=dev && npm run build && npm run migration:run

cd /opt/app/client && echo "VITE_API_URL=" > .env
npm install && npm run build

# systemd-сервис для бэкенда — см. пример unit-файла выше по структуре
# Nginx — см. схему выше (статика + proxy_pass на /auth, /users, /api)
```

Полный набор команд длиннее (systemd unit, конфиг Nginx, ufw, swap для слабых
VPS) — при необходимости попросите собрать их в скрипт.

## Альтернатива: деплой на Render

В репозитории также есть `render.yaml` — blueprint, поднимающий PostgreSQL,
backend и frontend как отдельные управляемые сервисы Render (вместо одного
VPS). Подходит, если не хочется администрировать сервер самостоятельно.

1. Зарегистрируйтесь на [render.com](https://render.com) (бесплатно, через GitHub).
2. **New → Blueprint** → выберите этот репозиторий → Render найдёт `render.yaml`
   и предложит создать 3 ресурса: `nova-db`, `nova-server`, `nova-client`.
3. После деплоя `nova-server` и `nova-client` скопируйте их URL из дашборда.
4. **nova-server → Environment**: `FRONTEND_URL` = URL клиента,
   `UNISENDER_API_KEY`, `UNISENDER_LIST_ID`, `SENDER_EMAIL` — как в `.env.example`.
5. **nova-client → Environment**: `VITE_API_URL` = URL сервера.
6. **Manual Deploy → Deploy latest commit** на обоих сервисах (фронту обязательна
   пересборка — `VITE_API_URL` вшивается в бандл на этапе сборки).

Поскольку почта идёт через HTTP API UniSender (а не SMTP), блокировка
SMTP-портов на бесплатном плане Render значения не имеет — деплой работает
на free-плане без дополнительных затрат. Free PostgreSQL на Render ограничен
по времени жизни — для долгосрочного использования нужен платный план либо
переезд на другую управляемую БД (Supabase/Neon).

## Известные особенности

- Регистрация выдаёт JWT сразу (пользователь считается вошедшим), а
  `isEmailConfirmed` — отдельный статус-флаг, а не блокировка входа.
- Пароль: минимум 8 символов, минимум одна заглавная буква, одна цифра и один
  спецсимвол — проверяется одинаково и на клиенте (Zod), и на сервере
  (`class-validator`).
- `forgot-password` всегда отвечает одинаково (не раскрывает, существует ли email).
- Регистрация ограничена rate-limit'ом: 10 запросов / 5 минут с одного IP.
