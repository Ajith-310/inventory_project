import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { IsNotEmpty, IsUUID, IsPositive, IsEnum, IsOptional } from 'class-validator';
import { Product } from './Product';
import { Warehouse } from './Warehouse';
import { User } from './User';

export enum MovementType {
  IN = 'in',
  OUT = 'out',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment'
}

export enum ReferenceType {
  PURCHASE_ORDER = 'purchase_order',
  SALE = 'sale',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment'
}

@Entity('inventory_movements')
@Index(['product_id'])
@Index(['warehouse_id'])
@Index(['created_at'])
@Index(['movement_type'])
export class InventoryMovement {
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

  @Column({
    type: 'enum',
    enum: MovementType
  })
  @IsEnum(MovementType)
  movement_type!: MovementType;

  @Column({ type: 'integer' })
  @IsPositive()
  quantity!: number;

  @Column({
    type: 'enum',
    enum: ReferenceType,
    nullable: true
  })
  @IsOptional()
  @IsEnum(ReferenceType)
  reference_type?: ReferenceType;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  reference_id?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  notes?: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  created_by!: string;

  @CreateDateColumn()
  created_at!: Date;

  // Relationships
  @ManyToOne(() => Product, product => product.id)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => Warehouse, warehouse => warehouse.id)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: Warehouse;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'created_by' })
  createdByUser!: User;

  // Method to get movement summary
  get summary(): string {
    const direction = this.movement_type === MovementType.IN ? 'IN' : 
                     this.movement_type === MovementType.OUT ? 'OUT' : 
                     this.movement_type === MovementType.TRANSFER ? 'TRANSFER' : 'ADJUSTMENT';
    
    return `${direction} ${this.quantity} units of ${this.product?.name || 'Product'}`;
  }

  // Method to get formatted movement type
  get formattedMovementType(): string {
    return this.movement_type.charAt(0).toUpperCase() + this.movement_type.slice(1);
  }

  // Method to check if movement is positive (adds stock)
  get isPositive(): boolean {
    return this.movement_type === MovementType.IN || this.movement_type === MovementType.ADJUSTMENT;
  }

  // Method to check if movement is negative (removes stock)
  get isNegative(): boolean {
    return this.movement_type === MovementType.OUT;
  }

  // Method to get effective quantity (positive for in, negative for out)
  get effectiveQuantity(): number {
    return this.isPositive ? this.quantity : -this.quantity;
  }

  // Method to get formatted date
  get formattedDate(): string {
    return this.created_at.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Method to get reference summary
  get referenceSummary(): string {
    if (!this.reference_type || !this.reference_id) return 'Manual';
    
    const typeMap = {
      [ReferenceType.PURCHASE_ORDER]: 'Purchase Order',
      [ReferenceType.SALE]: 'Sale',
      [ReferenceType.TRANSFER]: 'Transfer',
      [ReferenceType.ADJUSTMENT]: 'Adjustment'
    };
    
    return `${typeMap[this.reference_type]} #${this.reference_id.slice(0, 8)}`;
  }
} 