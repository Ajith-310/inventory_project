// Export all entities
export { User, UserRole } from './User';
export { Category } from './Category';
export { Supplier } from './Supplier';
export { Warehouse } from './Warehouse';
export { Product } from './Product';
export { Inventory } from './Inventory';
export { InventoryMovement, MovementType, ReferenceType } from './InventoryMovement';
export { PurchaseOrder, PurchaseOrderStatus } from './PurchaseOrder';
export { PurchaseOrderItem } from './PurchaseOrderItem';

// Export all entities as an array for TypeORM
import { User } from './User';
import { Category } from './Category';
import { Supplier } from './Supplier';
import { Warehouse } from './Warehouse';
import { Product } from './Product';
import { Inventory } from './Inventory';
import { InventoryMovement } from './InventoryMovement';
import { PurchaseOrder } from './PurchaseOrder';
import { PurchaseOrderItem } from './PurchaseOrderItem';

export const entities = [
  User,
  Category,
  Supplier,
  Warehouse,
  Product,
  Inventory,
  InventoryMovement,
  PurchaseOrder,
  PurchaseOrderItem
]; 