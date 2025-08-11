import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { IsNotEmpty, IsUUID, IsPositive, IsOptional } from 'class-validator';
import { PurchaseOrder } from './PurchaseOrder';
import { Product } from './Product';

@Entity('purchase_order_items')
@Index(['purchase_order_id'])
@Index(['product_id'])
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  purchase_order_id!: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  product_id!: string;

  @Column({ type: 'integer' })
  @IsPositive()
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsPositive()
  unit_price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, generatedType: 'STORED', asExpression: 'quantity * unit_price' })
  total_price!: number;

  @Column({ type: 'integer', default: 0 })
  @IsOptional()
  received_quantity!: number;

  @CreateDateColumn()
  created_at!: Date;

  // Relationships
  @ManyToOne(() => PurchaseOrder, po => po.items)
  @JoinColumn({ name: 'purchase_order_id' })
  purchase_order!: PurchaseOrder;

  @ManyToOne(() => Product, product => product.id)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  // Method to get item summary
  get summary(): string {
    return `${this.quantity} x ${this.product?.name || 'Product'} @ $${this.unit_price.toFixed(2)}`;
  }

  // Method to get formatted unit price
  get formattedUnitPrice(): string {
    return `$${this.unit_price.toFixed(2)}`;
  }

  // Method to get formatted total price
  get formattedTotalPrice(): string {
    return `$${this.total_price.toFixed(2)}`;
  }

  // Method to check if item is fully received
  get isFullyReceived(): boolean {
    return this.received_quantity >= this.quantity;
  }

  // Method to check if item is partially received
  get isPartiallyReceived(): boolean {
    return this.received_quantity > 0 && this.received_quantity < this.quantity;
  }

  // Method to check if item is not received
  get isNotReceived(): boolean {
    return this.received_quantity === 0;
  }

  // Method to get remaining quantity to receive
  get remainingQuantity(): number {
    return Math.max(0, this.quantity - this.received_quantity);
  }

  // Method to get received percentage
  get receivedPercentage(): number {
    if (this.quantity === 0) return 0;
    return Math.round((this.received_quantity / this.quantity) * 100);
  }

  // Method to receive items
  receiveItems(amount: number): boolean {
    if (amount <= 0 || amount > this.remainingQuantity) return false;
    this.received_quantity += amount;
    return true;
  }

  // Method to get status
  get status(): 'not_received' | 'partially_received' | 'fully_received' {
    if (this.isFullyReceived) return 'fully_received';
    if (this.isPartiallyReceived) return 'partially_received';
    return 'not_received';
  }

  // Method to get status color (for UI)
  get statusColor(): string {
    switch (this.status) {
      case 'fully_received': return 'success';
      case 'partially_received': return 'warning';
      case 'not_received': return 'error';
      default: return 'default';
    }
  }
} 