export interface AppConfig {
  nodeEnv: string;
  port: number;
  frontendUrl: string;
  serviceName: string;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  mail: {
    unisenderApiKey: string;
    unisenderListId: string;
    senderEmail: string;
    senderName: string;
  };
}

// Единая типизированная конфигурация приложения, собранная из process.env.
// Значения уже провалидированы в validation.ts до вызова этой функции.
export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '5000', 10),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  serviceName: 'Nova',
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'auth_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change_me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  mail: {
    // Письма отправляются через HTTP API UniSender (не SMTP): SMTP-порты
    // блокированы почти на всех бюджетных хостингах (проверено на Render
    // и на VPS NetAngels) — HTTPS-запросы к API такие блокировки не встречают.
    // sender_email должен быть подтверждённым отправителем на домене,
    // верифицированном в UniSender (см. server/.env.example).
    unisenderApiKey: process.env.UNISENDER_API_KEY ?? '',
    unisenderListId: process.env.UNISENDER_LIST_ID ?? '',
    senderEmail: process.env.SENDER_EMAIL ?? 'no-reply@example.com',
    senderName: process.env.SENDER_NAME ?? 'Nova',
  },
});
