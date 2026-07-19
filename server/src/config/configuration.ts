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
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    from: string;
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
    smtpHost: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT ?? '587', 10),
    smtpUser: process.env.SMTP_USER ?? '',
    smtpPass: process.env.SMTP_PASS ?? '',
    from: process.env.MAIL_FROM ?? 'Nova <no-reply@example.com>',
  },
});
