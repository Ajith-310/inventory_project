import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  Index
} from 'typeorm';
import { IsEmail, MinLength, IsEnum } from 'class-validator';
import * as bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  @MinLength(6)
  password_hash!: string;

  @Column({ type: 'varchar', length: 100 })
  first_name!: string;

  @Column({ type: 'varchar', length: 100 })
  last_name!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER
  })
  @IsEnum(UserRole)
  role!: UserRole;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Virtual property for full name
  get full_name(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  // Hash password before inserting
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password_hash && this.password_hash.length < 60) {
      this.password_hash = await bcrypt.hash(this.password_hash, 12);
    }
  }

  // Method to compare password
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password_hash);
  }

  // Method to get user without sensitive data
  toJSON(): Partial<User> {
    const user = { ...this } as any;
    delete user.password_hash;
    return user;
  }
} 