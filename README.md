# Inventory Management System

## 📋 Project Overview
**Project Chosen**: Inventory Management System  
**Technology Stack**: React.js (Frontend), Node.js (Backend), PostgreSQL (Database), TypeORM (ORM)  
**Development Timeline**: 2-Day Sprint (Day 1: Foundation, Day 2: Advanced Features)

## 🏗️ System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) with Dark Theme
- **State Management**: React Context + useReducer
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Real-time**: Socket.io client

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM**: TypeORM with PostgreSQL
- **Authentication**: JWT with refresh tokens
- **Validation**: Joi/Yup
- **Real-time**: Socket.io server

### Database Architecture
- **Database**: PostgreSQL 14+
- **ORM**: TypeORM
- **Migrations**: TypeORM migrations
- **Seeding**: TypeORM seeders

## 🎯 Core Features

### Phase 1 (Day 1) - Foundation
- [x] Project setup and architecture
- [ ] Database schema design
- [ ] Basic CRUD operations
- [ ] Authentication system
- [ ] Core UI components

### Phase 2 (Day 2) - Advanced Features
- [ ] Dashboard and analytics
- [ ] Stock alerts and notifications
- [ ] Purchase order management
- [ ] Reporting system
- [ ] Advanced UI/UX

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation
```bash
# Clone repository
git clone <repository-url>
cd inventory-management

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## 📁 Project Structure
```
inventory-management/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   └── utils/         # Utility functions
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # TypeORM entities
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
├── database/              # Database migrations and seeds
└── docs/                  # Documentation
```

## 🔧 Development Commands
```bash
# Backend
npm run dev:server          # Start backend development server
npm run db:migrate          # Run database migrations
npm run db:seed             # Seed database with sample data
npm run test:server         # Run backend tests

# Frontend
npm run dev:client          # Start frontend development server
npm run build:client        # Build frontend for production
npm run test:client         # Run frontend tests

# Full Stack
npm run dev                 # Start both frontend and backend
npm run build              # Build both for production
```

## 📊 Database Schema

### Core Entities
- **Users**: Authentication and authorization
- **Products**: Product catalog with categories
- **Warehouses**: Multiple warehouse locations
- **Inventory**: Stock levels and movements
- **PurchaseOrders**: Supplier orders
- **Suppliers**: Vendor management
- **Categories**: Product categorization

## 🔐 Authentication
- JWT-based authentication
- Role-based access control (Admin, Manager, Operator, Viewer)
- Refresh token mechanism
- Password hashing with bcrypt

## 📈 Features Roadmap

### Completed ✅
- Project architecture design
- Development environment setup

### In Progress 🔄
- Database schema implementation
- Basic CRUD operations

### Planned 📋
- Authentication system
- Dashboard implementation
- Stock alerts
- Purchase order management
- Reporting system

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License
MIT License - see LICENSE file for details

## 📞 Support
For support and questions, please open an issue in the repository. 