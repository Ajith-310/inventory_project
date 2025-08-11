import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { Category } from './Category';
import { Supplier } from './Supplier';

@Entity('products')
@Index(['sku'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsNotEmpty()
  sku!: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name!: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description?: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  supplier_id?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: { to: (value: number) => value, from: (value: string | number) => typeof value === 'string' ? parseFloat(value) : value } })
  @IsOptional()
  @IsPositive()
  unit_price?: number;

  @Column({ type: 'integer', default: 0, transformer: { to: (value: number) => value, from: (value: string | number) => typeof value === 'string' ? parseInt(value) : value } })
  @IsOptional()
  reorder_point!: number;

  @Column({ type: 'integer', nullable: true, transformer: { to: (value: number) => value, from: (value: string | number) => typeof value === 'string' ? parseInt(value) : value } })
  @IsOptional()
  @IsPositive()
  max_stock?: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => Category, category => category.id)
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @ManyToOne(() => Supplier, supplier => supplier.id)
  @JoinColumn({ name: 'supplier_id' })
  supplier?: Supplier;

  // Method to get product summary
  get summary(): string {
    return `${this.sku} - ${this.name}`;
  }

  // Method to check if product needs reordering
  get needsReorder(): boolean {
    // This would need to be calculated with actual inventory data
    return false;
  }

  // Method to get formatted price
  get formattedPrice(): string {
    return this.unit_price ? `$${this.unit_price.toFixed(2)}` : 'N/A';
  }

  // Method to check if product has pricing
  get hasPricing(): boolean {
    return this.unit_price !== null && this.unit_price !== undefined && this.unit_price > 0;
  }

  // Method to check if product has reorder point set
  get hasReorderPoint(): boolean {
    return this.reorder_point > 0;
  }

  // Method to check if product has max stock set
  get hasMaxStock(): boolean {
    return this.max_stock !== null && this.max_stock !== undefined && this.max_stock > 0;
  }
} 