# 📦 Inventory Management System

Enterprise-grade QR Code based inventory management system built with the MERN stack (MongoDB, Express.js, React, Node.js).


## 🚀 Features

### 🛡️ Admin Features
- **User Management**: Create, view, update, and delete system users
- **System Dashboard**: View comprehensive system statistics and activity logs
- **Audit Logs**: Track all system actions for security and compliance
- **Configuration**: Manage system-wide settings

### 👤 User (Staff) Features
- **Dashboard**: Personal dashboard with relevant metrics
- **Inventory Management**: View products and update stock levels
- **Transactions**: Record stock entries (Purchase, Sale, etc.)
- **QR Scanning**: Scan product QR codes for quick access
- **Partner Management**: View customer and supplier lists
- **Profile Management**: Update personal details and password

### 🚀 Core System Features
- **Authentication**: Secure JWT-based login with Role-Based Access Control (RBAC)
- **Product Database**: Centralized product catalog with categories
- **Security**: Rate limiting, secure headers, and data validation
- **Notifications**: Email alerts for low stock (configurable)

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **QRCode** - QR code generation
- **Winston** - Logging
- **Nodemailer** - Email service

### Frontend (Not included in this repository)
- React.js
- Redux/Context API for state management
- Material-UI or similar UI library

## 📋 Prerequisites

- Node.js 16+
- MongoDB 4.4+
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-system
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/inventory_db
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   EMAIL_SERVICE=gmail
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=your_email@gmail.com
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure that the MongoDB is running on your system.

## 🚀 Running the Application

### Development Mode
```bash
cd backend
npm run dev
```

### Production Mode
```bash
cd backend
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env`).

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/updatepassword` - Update password

### User Management (Admin Only)
- `GET /api/v1/users` - Get all users
- `POST /api/v1/users` - Create a new user
- `GET /api/v1/users/:id` - Get specific user details
- `PUT /api/v1/users/:id` - Update user details
- `DELETE /api/v1/users/:id` - Delete a user
- `GET /api/v1/users/:id/activity` - View user activity logs

### Admin Operations
- `GET /api/v1/admin/stats` - Get system dashboard statistics
- `GET /api/v1/admin/logs` - View system logs

### Products
- `GET /api/v1/products` - Get all products
- `POST /api/v1/products` - Create product (Admin/Manager)
- `GET /api/v1/products/:id` - Get single product
- `PUT /api/v1/products/:id` - Update product (Admin/Manager)
- `DELETE /api/v1/products/:id` - Delete product (Admin only)
- `POST /api/v1/products/:id/stock` - Update stock level
- `GET /api/v1/products/:id/qr` - Generate QR code for product

### Categories
- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create category (Admin/Manager)
- `GET /api/v1/categories/:id` - Get single category
- `PUT /api/v1/categories/:id` - Update category (Admin/Manager)
- `DELETE /api/v1/categories/:id` - Delete category (Admin only)

### Inventory & Audit
- `GET /api/v1/inventory/summary` - Get inventory summary
- `GET /api/v1/inventory/logs` - Get inventory movement logs
- `GET /api/v1/inventory/audit` - Get system audit logs (Admin only)
- `POST /api/v1/inventory/export` - Export inventory data

### Health Check
- `GET /api/v1/health` - API health check

## 📁 The Project Structure

```
inventory-system/
├── backend/
│   ├── config/
│   │   ├── constants.js
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── inventoryController.js
│   │   ├── productController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/
│   │   ├── AuditLog.js
│   │   ├── Category.js
│   │   ├── InventoryLog.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── categories.js
│   │   ├── index.js
│   │   ├── inventory.js
│   │   ├── products.js
│   │   └── users.js
│   ├── services/
│   │   ├── emailService.js
│   │   └── inventoryService.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── errorResponse.js
│   │   ├── exportUtils.js
│   │   ├── logger.js
│   │   ├── qrGenerator.js
│   │   ├── token.js
│   │   └── validation.js
│   ├── logs/
│   ├── package.json
│   └── server.js
└── README.md
```

## 🧪 Testing

```bash
cd backend
npm test
```

For watch mode:
```bash
npm run test:watch
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run seed` - Seed database with sample data
- `npm run seed:clean` - Clean seeded data

## 🤝 Contributing

1. Fork the repository
2. Create a new feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@inventorysystem.com or create an issue in this repository.


