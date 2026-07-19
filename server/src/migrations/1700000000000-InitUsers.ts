import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

// Начальная миграция: создаёт таблицу users в точном соответствии с сущностью User.
export class InitUsers1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Расширение для генерации UUID на стороне БД.
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'passwordHash', type: 'varchar' },
          { name: 'firstName', type: 'varchar' },
          { name: 'lastName', type: 'varchar', isNullable: true },
          {
            name: 'isEmailConfirmed',
            type: 'boolean',
            default: false,
          },
          { name: 'confirmationToken', type: 'varchar', isNullable: true },
          { name: 'resetPasswordToken', type: 'varchar', isNullable: true },
          {
            name: 'resetPasswordExpires',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_email',
        columnNames: ['email'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_email');
    await queryRunner.dropTable('users');
  }
}
