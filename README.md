# Online Shops Platform

A comprehensive e-commerce platform for managing a chain of online shops with multiple user interfaces and role-based access control.

## 🏗️ Architecture Overview

This platform consists of multiple applications working together to provide a complete e-commerce solution:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Client App     │  │ Shop Owner      │  │ Admin Panel     │  │ Customer Care   │
│  (Port 3000)    │  │ Dashboard       │  │ (Port 3002)     │  │ Dashboard       │
│                 │  │ (Port 3001)     │  │                 │  │ (Port 3003)     │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
         │                     │                     │                     │
         └─────────────────────┼─────────────────────┼─────────────────────┘
                               │                     │
                    ┌─────────────────────────────────┐
                    │      Backend API                │
                    │      (Port 5000)                │
                    │                                 │
                    │  ┌─────────────────────────────┐│
                    │  │     Shared Services         ││
                    │  │   & Utilities               ││
                    │  └─────────────────────────────┘│
                    └─────────────────────────────────┘
                               │
                    ┌─────────────────────────────────┐
                    │      MongoDB Database           │
                    └─────────────────────────────────┘
```

## 🌟 Features

### Client Application (Customer-facing)
- **Shop Discovery**: Browse shops by categories
- **Product Catalog**: View products with detailed information
- **Shopping Cart**: Add/remove products, manage quantities
- **Checkout Process**: Secure payment processing
- **User Accounts**: Registration, login, profile management
- **Order Tracking**: View order history and status
- **Search & Filters**: Find products and shops easily
- **Reviews & Ratings**: Customer feedback system

### Shop Owner Dashboard
- **Product Management**: Add, edit, delete products
- **Inventory Control**: Track stock levels
- **Order Management**: Process customer orders
- **Analytics**: Sales reports and insights
- **Shop Settings**: Customize shop appearance and information
- **Customer Communication**: Handle customer inquiries
- **Promotions**: Create discounts and offers
- **Financial Reports**: Revenue tracking and analysis

### Admin Panel
- **User Management**: Manage all platform users
- **Shop Management**: Approve/suspend shops
- **Category Management**: Organize product categories
- **Order Oversight**: Monitor all platform orders
- **Content Management**: Platform-wide content control
- **Analytics Dashboard**: Platform performance metrics
- **System Settings**: Platform configuration
- **Audit Logs**: Track all administrative actions

### Customer Care Dashboard
- **Support Tickets**: Handle customer issues
- **Live Chat**: Real-time customer support
- **Customer Management**: View customer profiles and history
- **Knowledge Base**: Maintain help documentation
- **Communication Center**: Email and notification management
- **Reports**: Support performance metrics
- **Team Management**: Assign tickets to team members

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/online-shops-platform.git
   cd online-shops-platform
   ```

2. **Install dependencies for all applications:**
   ```bash
   npm run setup
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers:**
   ```bash
   npm run dev
   ```

This will start all applications concurrently:
- Backend API: http://localhost:5000
- Client App: http://localhost:3000
- Shop Owner Dashboard: http://localhost:3001
- Admin Panel: http://localhost:3002
- Customer Care Dashboard: http://localhost:3003

## 📁 Project Structure

```
online-shops-platform/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   └── tests/              # Backend tests
├── client-frontend/         # Customer-facing React app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── contexts/       # React contexts
│   └── public/             # Static assets
├── shop-owner-dashboard/    # Shop owner React app
├── admin-panel/            # Admin React app
├── customer-care-dashboard/ # Customer care React app
├── shared/                 # Shared utilities and components
│   ├── components/         # Common UI components
│   ├── utils/              # Shared utility functions
│   ├── services/           # Shared API services
│   ├── types/              # TypeScript type definitions
│   └── constants/          # Shared constants
├── docs/                   # Documentation files
├── config/                 # Global configuration
└── package.json            # Root package.json with workspaces
```

## 🛠️ Development

### Available Scripts

**Root level commands:**
- `npm run dev` - Start all applications in development mode
- `npm run build` - Build all applications for production
- `npm run test` - Run tests for all applications
- `npm run lint` - Lint all applications
- `npm run clean` - Clean all node_modules and build files

**Individual application commands:**
- `npm run dev:backend` - Start only the backend
- `npm run dev:client` - Start only the client app
- `npm run dev:shop-owner` - Start only the shop owner dashboard
- `npm run dev:admin` - Start only the admin panel
- `npm run dev:customer-care` - Start only the customer care dashboard

### Database Setup

1. **Install MongoDB** locally or use MongoDB Atlas
2. **Update the connection string** in your `.env` file
3. **Run database migrations** (if any):
   ```bash
   cd backend && npm run migrate
   ```
4. **Seed initial data** (optional):
   ```bash
   cd backend && npm run seed
   ```

### API Documentation

The backend API is documented using OpenAPI/Swagger. Once the backend is running, visit:
- http://localhost:5000/api-docs

### Testing

Run tests for specific applications:
```bash
# Backend tests
cd backend && npm test

# Frontend tests (any of the React apps)
cd client-frontend && npm test
```

## 🔐 Authentication & Authorization

The platform uses JWT-based authentication with role-based access control:

### User Roles:
- **Customer**: Can browse and purchase from shops
- **Shop Owner**: Can manage their own shop and products
- **Admin**: Full platform access and management
- **Customer Care**: Access to support tools and customer data

### Authentication Flow:
1. User logs in with email/password
2. Backend validates credentials and returns JWT token
3. Token is stored in frontend localStorage
4. Token is sent with each API request
5. Backend validates token and user permissions

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
Create production environment files:
- `.env.production` for backend
- `.env.production` for each frontend application

### Deployment Options

**Backend (Node.js):**
- Heroku
- AWS EC2/Elastic Beanstalk
- Digital Ocean Droplets
- Google Cloud Platform

**Frontend (React Apps):**
- Netlify
- Vercel
- AWS S3 + CloudFront
- Firebase Hosting

**Database:**
- MongoDB Atlas (recommended)
- AWS DocumentDB
- Self-hosted MongoDB

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for full list):

**Backend:**
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `STRIPE_SECRET_KEY`: Payment processing
- `CLOUDINARY_*`: File upload service

**Frontend Apps:**
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_STRIPE_PUBLIC_KEY`: Payment processing

### Feature Flags

Enable/disable features using environment variables:
- `ENABLE_LIVE_CHAT`: Enable live chat feature
- `ENABLE_ANALYTICS`: Enable analytics tracking
- `ENABLE_REVIEWS`: Enable product reviews

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Use ESLint and Prettier for consistent code formatting
- Follow the existing naming conventions
- Write tests for new features
- Update documentation as needed

## 📚 API Reference

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### Shop Management
```
GET    /api/shops
POST   /api/shops
GET    /api/shops/:id
PUT    /api/shops/:id
DELETE /api/shops/:id
```

### Product Management
```
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
```

For complete API documentation, see the Swagger docs at `/api-docs` when running the backend.

## 🔍 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check if ports are in use
netstat -an | findstr :3000
netstat -an | findstr :5000
```

**Database connection issues:**
- Verify MongoDB is running
- Check connection string in `.env`
- Ensure database user has proper permissions

**Build failures:**
```bash
# Clear node_modules and reinstall
npm run clean
npm run setup
```

**CORS errors:**
- Verify frontend URLs in backend CORS configuration
- Check `.env` file for correct URLs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Development**: API, database, authentication
- **Frontend Development**: React applications, UI/UX
- **DevOps**: Deployment, monitoring, infrastructure
- **QA**: Testing, quality assurance

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

---

**Happy coding! 🎉**