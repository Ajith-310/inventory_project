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
import { IsNotEmpty, IsUUID, IsOptional, IsDateString, IsPositive } from 'class-validator';
import { Supplier } from './Supplier';
import { User } from './User';
import { PurchaseOrderItem } from './PurchaseOrderItem';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  ORDERED = 'ordered',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

@Entity('purchase_orders')
@Index(['po_number'], { unique: true })
@Index(['supplier_id'])
@Index(['status'])
@Index(['created_at'])
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsNotEmpty()
  po_number!: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  supplier_id!: string;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.DRAFT
  })
  status!: PurchaseOrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsPositive()
  total_amount?: number;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  order_date?: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  expected_delivery_date?: Date;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  created_by!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => Supplier, supplier => supplier.id)
  @JoinColumn({ name: 'supplier_id' })
  supplier!: Supplier;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'created_by' })
  createdByUser!: User;

  @OneToMany(() => PurchaseOrderItem, item => item.purchase_order)
  items!: PurchaseOrderItem[];

  // Method to get PO summary
  get summary(): string {
    return `PO #${this.po_number} - ${this.supplier?.name || 'Supplier'} (${this.status})`;
  }

  // Method to check if PO can be approved
  get canBeApproved(): boolean {
    return this.status === PurchaseOrderStatus.DRAFT || this.status === PurchaseOrderStatus.PENDING;
  }

  // Method to check if PO can be ordered
  get canBeOrdered(): boolean {
    return this.status === PurchaseOrderStatus.APPROVED;
  }

  // Method to check if PO can be received
  get canBeReceived(): boolean {
    return this.status === PurchaseOrderStatus.ORDERED;
  }

  // Method to check if PO can be cancelled
  get canBeCancelled(): boolean {
    return [PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.PENDING, PurchaseOrderStatus.APPROVED].includes(this.status);
  }

  // Method to get formatted total amount
  get formattedTotalAmount(): string {
    return this.total_amount ? `$${this.total_amount.toFixed(2)}` : 'N/A';
  }

  // Method to get formatted order date
  get formattedOrderDate(): string {
    return this.order_date ? this.order_date.toLocaleDateString('en-US') : 'Not set';
  }

  // Method to get formatted expected delivery date
  get formattedExpectedDeliveryDate(): string {
    return this.expected_delivery_date ? this.expected_delivery_date.toLocaleDateString('en-US') : 'Not set';
  }

  // Method to check if PO is overdue
  get isOverdue(): boolean {
    if (!this.expected_delivery_date || this.status === PurchaseOrderStatus.RECEIVED) return false;
    return new Date() > this.expected_delivery_date;
  }

  // Method to get days until delivery
  get daysUntilDelivery(): number | null {
    if (!this.expected_delivery_date) return null;
    const today = new Date();
    const deliveryDate = new Date(this.expected_delivery_date);
    const diffTime = deliveryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Method to calculate total amount from items
  calculateTotalAmount(): number {
    if (!this.items) return 0;
    return this.items.reduce((total, item) => total + (item.total_price || 0), 0);
  }

  // Method to get items count
  get itemsCount(): number {
    return this.items ? this.items.length : 0;
  }

  // Method to get received items count
  get receivedItemsCount(): number {
    if (!this.items) return 0;
    return this.items.filter(item => item.received_quantity > 0).length;
  }

  // Method to check if all items are received
  get isFullyReceived(): boolean {
    if (!this.items || this.items.length === 0) return false;
    return this.items.every(item => item.received_quantity >= item.quantity);
  }
} 