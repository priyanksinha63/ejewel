# eJewel - Premium Gold & Silver Jewelry E-Commerce Platform

A full-stack e-commerce platform for selling gold and silver jewelry, built with modern technologies.

![eJewel](https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200)

## 🌟 Features

### Customer Features
- **Product Catalog** - Browse products with advanced filtering by metal type, category, price range, and purity
- **Search** - Full-text search across products
- **Shopping Cart** - Add items, update quantities, and proceed to checkout
- **Wishlist** - Save favorite products for later
- **User Authentication** - Secure registration, login, and password management
- **Order Management** - Track orders, view order history, and cancel orders
- **Product Reviews** - Rate and review purchased products
- **Address Management** - Save multiple delivery addresses

### Admin Features
- **Dashboard** - Real-time analytics with revenue, orders, and user statistics
- **Product Management** - Create, update, and delete products with variants
- **Category Management** - Organize products into categories
- **Order Management** - Update order status, add tracking information
- **User Management** - View users, change roles, activate/deactivate accounts
- **Low Stock Alerts** - Monitor products running low on inventory

## 🛠️ Tech Stack

### Backend
- **Go** - Fast, compiled language for high-performance API
- **Gin** - HTTP web framework for Go
- **MongoDB** - NoSQL database for flexible data storage
- **JWT** - Token-based authentication

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **Framer Motion** - Smooth animations
- **Lucide Icons** - Beautiful icon library

## 🚀 Getting Started

### Prerequisites
- Go 1.21+
- Node.js 18+
- MongoDB 7+
- Docker (optional)

### Quick Start with Docker

```bash
# Clone the repository
cd /var/www/html/ejewel

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

### Manual Setup

#### Backend

```bash
cd backend

# Install dependencies
go mod download

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI

# Run the server
go run cmd/main.go
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8080/api" > .env

# Start development server
npm run dev
```

## 📁 Project Structure

```
ejewel/
├── backend/
│   ├── cmd/
│   │   └── main.go              # Application entry point
│   ├── internal/
│   │   ├── config/              # Configuration management
│   │   ├── database/            # MongoDB connection
│   │   ├── handlers/            # HTTP request handlers
│   │   ├── middleware/          # Auth & CORS middleware
│   │   ├── models/              # Data models
│   │   └── utils/               # Helper functions
│   ├── go.mod
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                 # API client functions
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   ├── stores/              # Zustand stores
│   │   ├── types/               # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔐 Default Credentials

| Role  | Email              | Password  |
|-------|-------------------|-----------|
| Admin | admin@ejewel.com  | admin123  |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/:id` - Get product details
- `GET /api/products/featured` - Get featured products
- `GET /api/products/new-arrivals` - Get new arrivals
- `GET /api/products/search?q=` - Search products

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category details

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove from cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/cancel` - Cancel order

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - List users
- `GET /api/admin/orders` - List all orders
- `PUT /api/admin/orders/:id/status` - Update order status

## 🎨 UI Features

- **Dark Theme** - Elegant dark design with gold accents
- **Responsive** - Mobile-first, works on all devices
- **Animations** - Smooth page transitions and micro-interactions
- **Loading States** - Skeleton loaders for better UX
- **Toast Notifications** - Feedback for user actions

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=ejewel
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
PORT=8080
ADMIN_EMAIL=admin@ejewel.com
ADMIN_PASSWORD=admin123
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080/api
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Author

Built with ❤️ for jewelry lovers everywhere.

