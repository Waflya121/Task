import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';

// DataSource используется TypeORM CLI для генерации и запуска миграций.
loadEnv();

// Единственный экспорт DataSource — TypeORM CLI требует ровно один экспорт
// экземпляра DataSource в этом файле, иначе падает с ошибкой при загрузке.
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'auth_db',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  // Никогда не используем автосинхронизацию — только реальные миграции.
  synchronize: false,
  logging: false,
});

export default AppDataSource;
