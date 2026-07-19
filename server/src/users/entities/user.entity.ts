import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  passwordHash!: string;

  @Column({ type: 'varchar' })
  firstName!: string;

  @Column({ type: 'varchar', nullable: true })
  lastName!: string | null;

  @Column({ type: 'boolean', default: false })
  isEmailConfirmed!: boolean;

  @Column({ type: 'varchar', nullable: true })
  confirmationToken!: string | null;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
