import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique
} from 'typeorm';
import { IsNotEmpty, IsUUID, IsPositive, IsOptional } from 'class-validator';
import { Product } from './Product';
import { Warehouse } from './Warehouse';

@Entity('inventory')
@Unique(['product_id', 'warehouse_id'])
@Index(['product_id'])
@Index(['warehouse_id'])
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  product_id!: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  warehouse_id!: string;

  @Column({ type: 'integer', default: 0 })
  @IsPositive()
  quantity!: number;

  @Column({ type: 'integer', default: 0 })
  @IsPositive()
  reserved_quantity!: number;

  @Column({ type: 'integer', generatedType: 'STORED', asExpression: 'quantity - reserved_quantity' })
  available_quantity!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => Product, product => product.id)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => Warehouse, warehouse => warehouse.id)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: Warehouse;

  // Method to check if stock is low
  get isLowStock(): boolean {
    if (!this.product?.reorder_point) return false;
    return this.available_quantity <= this.product.reorder_point;
  }

  // Method to check if stock is out
  get isOutOfStock(): boolean {
    return this.available_quantity <= 0;
  }

  // Method to get stock status
  get stockStatus(): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (this.isOutOfStock) return 'out_of_stock';
    if (this.isLowStock) return 'low_stock';
    return 'in_stock';
  }

  // Method to get stock percentage (if max stock is set)
  get stockPercentage(): number | null {
    if (!this.product?.max_stock) return null;
    return Math.round((this.available_quantity / this.product.max_stock) * 100);
  }

  // Method to check if warehouse is at capacity
  get isAtCapacity(): boolean {
    if (!this.warehouse?.capacity) return false;
    // This would need to sum all inventory in this warehouse
    return false;
  }

  // Method to get formatted quantity
  get formattedQuantity(): string {
    return `${this.available_quantity} available (${this.quantity} total, ${this.reserved_quantity} reserved)`;
  }

  // Method to update quantities
  updateQuantities(newQuantity: number, newReservedQuantity: number): void {
    this.quantity = newQuantity;
    this.reserved_quantity = newReservedQuantity;
    // available_quantity is computed automatically
  }

  // Method to add stock
  addStock(amount: number): void {
    this.quantity += amount;
  }

  // Method to remove stock
  removeStock(amount: number): boolean {
    if (this.available_quantity >= amount) {
      this.quantity -= amount;
      return true;
    }
    return false;
  }

  // Method to reserve stock
  reserveStock(amount: number): boolean {
    if (this.available_quantity >= amount) {
      this.reserved_quantity += amount;
      return true;
    }
    return false;
  }

  // Method to release reserved stock
  releaseReservedStock(amount: number): boolean {
    if (this.reserved_quantity >= amount) {
      this.reserved_quantity -= amount;
      return true;
    }
    return false;
  }
} 