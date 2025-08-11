import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

@Entity('warehouses')
@Index(['name'], { unique: true })
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name!: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  address!: string;

  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsPositive()
  capacity?: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Method to get warehouse summary
  get summary(): string {
    return `${this.name} - ${this.address}`;
  }

  // Method to check if warehouse has capacity limit
  get hasCapacityLimit(): boolean {
    return this.capacity !== null && this.capacity !== undefined && this.capacity > 0;
  }

  // Method to get formatted address
  get formattedAddress(): string {
    return this.address.replace(/\n/g, ', ');
  }

  // Method to check if warehouse is at capacity (would need inventory data)
  get isAtCapacity(): boolean {
    // This would need to be calculated with actual inventory data
    return false;
  }
} 