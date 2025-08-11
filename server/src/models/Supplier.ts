import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

@Entity('suppliers')
@Index(['name'], { unique: true })
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  phone?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  address?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  contact_person?: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Method to get supplier summary
  get summary(): string {
    return `${this.name}${this.contact_person ? ` - ${this.contact_person}` : ''}`;
  }

  // Method to check if supplier has contact information
  get hasContactInfo(): boolean {
    return !!(this.email || this.phone || this.contact_person);
  }

  // Method to get formatted contact information
  get contactInfo(): string {
    const info: string[] = [];
    
    if (this.contact_person) info.push(`Contact: ${this.contact_person}`);
    if (this.email) info.push(`Email: ${this.email}`);
    if (this.phone) info.push(`Phone: ${this.phone}`);
    
    return info.join(' | ');
  }
} 