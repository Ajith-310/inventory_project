const fs = require('fs');
const path = require('path');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  
  const envContent = `# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=inventory_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=debug
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('✅ .env file already exists');
}

console.log('\n🚀 Development Setup Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Make sure PostgreSQL is running');
console.log('2. Create database: inventory_db');
console.log('3. Run: npm run seed (to populate database)');
console.log('4. Run: npm run dev (to start server)');
console.log('\n🔑 Default Login Credentials:');
console.log('Admin: admin@inventory.com / admin123');
console.log('Manager: manager@inventory.com / manager123');
console.log('Operator: operator@inventory.com / operator123'); 