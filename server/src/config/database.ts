import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import path from 'path';
import { entities } from '../models';

// Load environment variables
config();

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource(
  process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        synchronize: !isProduction, // usually false in production
        logging: !isProduction,
        entities: entities,
        migrations: [path.join(__dirname, '../database/migrations/**/*.{ts,js}')],
        subscribers: [path.join(__dirname, '../database/subscribers/**/*.{ts,js}')],
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      }
    : {
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USERNAME || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'password',
        database: process.env.DATABASE_NAME || 'inventory_db',
        synchronize: !isProduction,
        logging: !isProduction,
        entities: entities,
        migrations: [path.join(__dirname, '../database/migrations/**/*.{ts,js}')],
        subscribers: [path.join(__dirname, '../database/subscribers/**/*.{ts,js}')],
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      }
);

// Initialize database connection
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Close database connection
export const closeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};
