# 📦 Inventory Management System

Enterprise-grade QR Code based inventory management system built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Product Management**: CRUD operations for products with QR code generation
- **Category Management**: Organize products into categories
- **Inventory Tracking**: Real-time inventory monitoring and logging
- **Audit Logging**: Comprehensive logging for all inventory changes
- **QR Code Integration**: Generate and scan QR codes for products
- **Email Notifications**: Automated email alerts for low stock and inventory updates
- **Data Export**: Export inventory data to CSV and PDF formats
- **API Rate Limiting**: Protection against abuse with rate limiting
- **Security**: Helmet.js for security headers, CORS, input validation

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
   Make sure MongoDB is running on your system.

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

### Users
- `GET /api/v1/users` - Get all users (Admin only)
- `GET /api/v1/users/:id` - Get single user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Products
- `GET /api/v1/products` - Get all products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/:id` - Get single product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `GET /api/v1/products/:id/qr` - Generate QR code for product

### Categories
- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create category
- `GET /api/v1/categories/:id` - Get single category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Inventory
- `GET /api/v1/inventory` - Get inventory summary
- `POST /api/v1/inventory/adjust` - Adjust inventory levels
- `GET /api/v1/inventory/logs` - Get inventory logs

### Health Check
- `GET /api/v1/health` - API health check

## 📁 Project Structure

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
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@inventorysystem.com or create an issue in this repository.


