# MERN Full-Stack Application with TypeScript

A complete full-stack MERN (MongoDB, Express.js, React, Node.js) application built with TypeScript, featuring modern development practices and tools.

## 🚀 Features

### Backend
- **Express.js** with TypeScript
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with refresh tokens
- **MVC Architecture** (Models, Views, Controllers)
- **RESTful API** design
- **Input validation** with express-validator
- **Error handling** middleware
- **Rate limiting** and security headers
- **CORS** configuration
- **Environment variables** management

### Frontend
- **React 18** with TypeScript
- **Zustand** for state management
- **React Router** for navigation
- **Shadcn UI** components
- **Lucide React** icons
- **React Hook Form** for form handling
- **TanStack Query** for data fetching
- **Tailwind CSS** for styling
- **Responsive design**

## 📁 Project Structure

```
mern-fullstack-app/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middlewares/    # Custom middlewares
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── helpers/        # Helper functions
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Express server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.tsx         # Main App component
│   ├── package.json
│   └── tsconfig.json
├── package.json            # Root package.json
├── env.example            # Environment variables template
└── README.md
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mern-fullstack-app
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit the .env file with your configuration
   # Make sure to set strong JWT secrets and MongoDB URI
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   # Default connection: mongodb://localhost:27017/mern-app
   ```

## 🚀 Running the Application

### Development Mode
```bash
# Run both backend and frontend concurrently
npm run dev

# Or run them separately:
# Backend only
npm run server

# Frontend only
npm run client
```

### Production Mode
```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 📋 Available Scripts

- `npm run dev` - Start both backend and frontend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build both backend and frontend for production
- `npm run install:all` - Install dependencies for both backend and frontend
- `npm start` - Start the production server
- `npm test` - Run tests for both backend and frontend

## 🔧 Configuration

### Backend Configuration
- **Port**: 5000 (configurable via PORT environment variable)
- **Database**: MongoDB (configurable via MONGODB_URI)
- **JWT**: Configure JWT secrets in environment variables
- **CORS**: Frontend URL configurable via FRONTEND_URL

### Frontend Configuration
- **Port**: 3000 (default React port)
- **API URL**: Configurable via REACT_APP_API_URL environment variable

## 🔐 Authentication

The application uses JWT-based authentication with the following features:
- User registration and login
- JWT access tokens (15 minutes expiry)
- Refresh tokens (7 days expiry)
- Automatic token refresh
- Protected routes
- Logout functionality

## 🎨 UI Components

The frontend uses Shadcn UI components with:
- Modern, accessible design
- Dark/light mode support
- Responsive layout
- Form validation
- Toast notifications
- Loading states

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Delete user account
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/search` - Search users

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run all tests
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Build the backend: `cd backend && npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)

### Frontend Deployment
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `build` folder to your preferred platform (Vercel, Netlify, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Contact the maintainers

## 🔄 Updates

This project is actively maintained and updated with:
- Security patches
- New features
- Performance improvements
- Bug fixes

---

**Happy Coding! 🎉**
