import { AppDataSource } from '../../config/database';
import { User, UserRole } from '../../models/User';
import { Category } from '../../models/Category';
import { Supplier } from '../../models/Supplier';
import { Warehouse } from '../../models/Warehouse';
import { Product } from '../../models/Product';
import { Inventory } from '../../models/Inventory';
import { PurchaseOrder, PurchaseOrderStatus } from '../../models/PurchaseOrder';
import { PurchaseOrderItem } from '../../models/PurchaseOrderItem';
import { InventoryMovement, MovementType, ReferenceType } from '../../models/InventoryMovement';

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Initialize database connection
    await AppDataSource.initialize();

    // Clear existing data (optional - be careful in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Clearing existing data...');
      await AppDataSource.dropDatabase();
      await AppDataSource.synchronize();
    }

    // Create users
    console.log('Creating users...');
    const userRepository = AppDataSource.getRepository(User);
    
    const adminUser = userRepository.create({
      email: 'admin@inventory.com',
      password_hash: 'admin123',
      first_name: 'Admin',
      last_name: 'User',
      role: UserRole.ADMIN,
      is_active: true
    });

    const managerUser = userRepository.create({
      email: 'manager@inventory.com',
      password_hash: 'manager123',
      first_name: 'Manager',
      last_name: 'User',
      role: UserRole.MANAGER,
      is_active: true
    });

    const operatorUser = userRepository.create({
      email: 'operator@inventory.com',
      password_hash: 'operator123',
      first_name: 'Operator',
      last_name: 'User',
      role: UserRole.OPERATOR,
      is_active: true
    });

    const savedUsers = await userRepository.save([adminUser, managerUser, operatorUser]);
    console.log(`✅ Created ${savedUsers.length} users`);

    // Create categories
    console.log('📂 Creating categories...');
    const categoryRepository = AppDataSource.getRepository(Category);
    
    const electronicsCategory = categoryRepository.create({
      name: 'Electronics',
      description: 'Electronic devices and components'
    });

    const clothingCategory = categoryRepository.create({
      name: 'Clothing',
      description: 'Apparel and accessories'
    });

    const booksCategory = categoryRepository.create({
      name: 'Books',
      description: 'Books and publications'
    });

    const savedCategories = await categoryRepository.save([
      electronicsCategory,
      clothingCategory,
      booksCategory
    ]);
    console.log(`✅ Created ${savedCategories.length} categories`);

    // Create suppliers
    console.log('🏢 Creating suppliers...');
    const supplierRepository = AppDataSource.getRepository(Supplier);
    
    const techSupplier = supplierRepository.create({
      name: 'TechCorp Electronics',
      email: 'orders@techcorp.com',
      phone: '+1-555-0123',
      address: '123 Tech Street, Silicon Valley, CA 94025',
      contact_person: 'John Tech',
      is_active: true
    });

    const fashionSupplier = supplierRepository.create({
      name: 'Fashion Forward Inc',
      email: 'orders@fashionforward.com',
      phone: '+1-555-0456',
      address: '456 Fashion Ave, New York, NY 10001',
      contact_person: 'Sarah Style',
      is_active: true
    });

    const bookSupplier = supplierRepository.create({
      name: 'BookWorld Publishers',
      email: 'orders@bookworld.com',
      phone: '+1-555-0789',
      address: '789 Book Lane, Boston, MA 02101',
      contact_person: 'Mike Reader',
      is_active: true
    });

    const savedSuppliers = await supplierRepository.save([
      techSupplier,
      fashionSupplier,
      bookSupplier
    ]);
    console.log(`✅ Created ${savedSuppliers.length} suppliers`);

    // Create warehouses
    console.log('🏭 Creating warehouses...');
    const warehouseRepository = AppDataSource.getRepository(Warehouse);
    
    const mainWarehouse = warehouseRepository.create({
      name: 'Main Warehouse',
      address: '1000 Industrial Blvd, Warehouse District, TX 75001',
      capacity: 10000,
      is_active: true
    });

    const eastWarehouse = warehouseRepository.create({
      name: 'East Coast Warehouse',
      address: '2000 Distribution Center, New Jersey, NJ 07001',
      capacity: 5000,
      is_active: true
    });

    const westWarehouse = warehouseRepository.create({
      name: 'West Coast Warehouse',
      address: '3000 Logistics Park, California, CA 90210',
      capacity: 7500,
      is_active: true
    });

    const savedWarehouses = await warehouseRepository.save([
      mainWarehouse,
      eastWarehouse,
      westWarehouse
    ]);
    console.log(`✅ Created ${savedWarehouses.length} warehouses`);

    // Create products
    console.log('📦 Creating products...');
    const productRepository = AppDataSource.getRepository(Product);
    
    const laptop = productRepository.create({
      sku: 'LAPTOP-001',
      name: 'Gaming Laptop',
      description: 'High-performance gaming laptop with RGB keyboard',
      category_id: savedCategories[0].id, // Electronics
      supplier_id: savedSuppliers[0].id, // TechCorp
      unit_price: 1299.99,
      reorder_point: 5,
      max_stock: 50,
      is_active: true
    });

    const smartphone = productRepository.create({
      sku: 'PHONE-001',
      name: 'Smartphone Pro',
      description: 'Latest smartphone with advanced camera system',
      category_id: savedCategories[0].id, // Electronics
      supplier_id: savedSuppliers[0].id, // TechCorp
      unit_price: 899.99,
      reorder_point: 10,
      max_stock: 100,
      is_active: true
    });

    const tshirt = productRepository.create({
      sku: 'TSHIRT-001',
      name: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt in various colors',
      category_id: savedCategories[1].id, // Clothing
      supplier_id: savedSuppliers[1].id, // Fashion Forward
      unit_price: 19.99,
      reorder_point: 50,
      max_stock: 500,
      is_active: true
    });

    const jeans = productRepository.create({
      sku: 'JEANS-001',
      name: 'Blue Jeans',
      description: 'Classic blue jeans with perfect fit',
      category_id: savedCategories[1].id, // Clothing
      supplier_id: savedSuppliers[1].id, // Fashion Forward
      unit_price: 49.99,
      reorder_point: 25,
      max_stock: 200,
      is_active: true
    });

    const novel = productRepository.create({
      sku: 'BOOK-001',
      name: 'The Great Adventure',
      description: 'Bestselling adventure novel',
      category_id: savedCategories[2].id, // Books
      supplier_id: savedSuppliers[2].id, // BookWorld
      unit_price: 14.99,
      reorder_point: 20,
      max_stock: 150,
      is_active: true
    });

    const savedProducts = await productRepository.save([
      laptop,
      smartphone,
      tshirt,
      jeans,
      novel
    ]);
    console.log(`✅ Created ${savedProducts.length} products`);

    // Create inventory
    console.log('📊 Creating inventory...');
    const inventoryRepository = AppDataSource.getRepository(Inventory);
    
    const laptopInventory = inventoryRepository.create({
      product_id: savedProducts[0].id,
      warehouse_id: savedWarehouses[0].id,
      quantity: 15,
      reserved_quantity: 2
    });

    const smartphoneInventory = inventoryRepository.create({
      product_id: savedProducts[1].id,
      warehouse_id: savedWarehouses[0].id,
      quantity: 25,
      reserved_quantity: 5
    });

    const tshirtInventory = inventoryRepository.create({
      product_id: savedProducts[2].id,
      warehouse_id: savedWarehouses[1].id,
      quantity: 100,
      reserved_quantity: 10
    });

    const jeansInventory = inventoryRepository.create({
      product_id: savedProducts[3].id,
      warehouse_id: savedWarehouses[1].id,
      quantity: 75,
      reserved_quantity: 15
    });

    const novelInventory = inventoryRepository.create({
      product_id: savedProducts[4].id,
      warehouse_id: savedWarehouses[2].id,
      quantity: 50,
      reserved_quantity: 5
    });

    const savedInventory = await inventoryRepository.save([
      laptopInventory,
      smartphoneInventory,
      tshirtInventory,
      jeansInventory,
      novelInventory
    ]);
    console.log(`✅ Created ${savedInventory.length} inventory records`);

    // Create purchase orders
    console.log('📋 Creating purchase orders...');
    const poRepository = AppDataSource.getRepository(PurchaseOrder);
    
    const po1 = poRepository.create({
      po_number: 'PO-2024-001',
      supplier_id: savedSuppliers[0].id,
      status: PurchaseOrderStatus.APPROVED,
      total_amount: 2599.98,
      order_date: new Date('2024-01-15'),
      expected_delivery_date: new Date('2024-01-30'),
      created_by: savedUsers[1].id // Manager
    });

    const po2 = poRepository.create({
      po_number: 'PO-2024-002',
      supplier_id: savedSuppliers[1].id,
      status: PurchaseOrderStatus.PENDING,
      total_amount: 1499.75,
      order_date: new Date('2024-01-20'),
      expected_delivery_date: new Date('2024-02-05'),
      created_by: savedUsers[1].id // Manager
    });

    const savedPOs = await poRepository.save([po1, po2]);
    console.log(`✅ Created ${savedPOs.length} purchase orders`);

    // Create purchase order items
    console.log('📝 Creating purchase order items...');
    const poiRepository = AppDataSource.getRepository(PurchaseOrderItem);
    
    const poi1 = poiRepository.create({
      purchase_order_id: savedPOs[0].id,
      product_id: savedProducts[0].id, // Laptop
      quantity: 2,
      unit_price: 1299.99,
      received_quantity: 0
    });

    const poi2 = poiRepository.create({
      purchase_order_id: savedPOs[1].id,
      product_id: savedProducts[2].id, // T-Shirt
      quantity: 75,
      unit_price: 19.99,
      received_quantity: 0
    });

    const savedPOItems = await poiRepository.save([poi1, poi2]);
    console.log(`✅ Created ${savedPOItems.length} purchase order items`);

    // Create inventory movements
    console.log('🔄 Creating inventory movements...');
    const movementRepository = AppDataSource.getRepository(InventoryMovement);
    
    const movement1 = movementRepository.create({
      product_id: savedProducts[0].id,
      warehouse_id: savedWarehouses[0].id,
      movement_type: MovementType.IN,
      quantity: 15,
      reference_type: ReferenceType.ADJUSTMENT,
      notes: 'Initial stock setup',
      created_by: savedUsers[0].id // Admin
    });

    const movement2 = movementRepository.create({
      product_id: savedProducts[1].id,
      warehouse_id: savedWarehouses[0].id,
      movement_type: MovementType.IN,
      quantity: 25,
      reference_type: ReferenceType.ADJUSTMENT,
      notes: 'Initial stock setup',
      created_by: savedUsers[0].id // Admin
    });

    const savedMovements = await movementRepository.save([movement1, movement2]);
    console.log(`✅ Created ${savedMovements.length} inventory movements`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Sample Data Summary:');
    console.log(`- Users: ${savedUsers.length}`);
    console.log(`- Categories: ${savedCategories.length}`);
    console.log(`- Suppliers: ${savedSuppliers.length}`);
    console.log(`- Warehouses: ${savedWarehouses.length}`);
    console.log(`- Products: ${savedProducts.length}`);
    console.log(`- Inventory Records: ${savedInventory.length}`);
    console.log(`- Purchase Orders: ${savedPOs.length}`);
    console.log(`- Purchase Order Items: ${savedPOItems.length}`);
    console.log(`- Inventory Movements: ${savedMovements.length}`);

    console.log('\n🔑 Default Login Credentials:');
    console.log('Admin: admin@inventory.com / admin123');
    console.log('Manager: manager@inventory.com / manager123');
    console.log('Operator: operator@inventory.com / operator123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase; 