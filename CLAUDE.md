# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a real estate management system (Sistema Imobiliário Litoral) built with:
- **Frontend**: React 18 with TypeScript, Vite, TailwindCSS
- **Backend**: Node.js/Express with MongoDB (mongodb-memory-server for development)
- **Authentication**: JWT-based with role-based access control (admin, professional, particular)

## Development Commands

### Frontend (root directory)
```bash
npm install          # Install dependencies
npm run dev          # Start development server (port 5173)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (server directory)
```bash
cd server
npm install          # Install dependencies
npm run dev          # Start development server with nodemon (port 5000)
npm start            # Start production server
```

## Architecture

### Frontend Structure
- **src/components/**: React components organized by feature (admin/, professional/, common/)
- **src/contexts/AuthContext.tsx**: Central authentication state management
- **src/hooks/**: Custom React hooks for data fetching and state management
- **src/config/api.ts**: API configuration and base URL setup
- **src/types/**: TypeScript type definitions

### Backend Structure
- **server/src/models/**: Mongoose schemas for MongoDB
- **server/src/controllers/**: Business logic for each route
- **server/src/routes/**: Express route definitions
- **server/src/middlewares/**: Authentication and validation middleware
- **server/src/utils/seedDatabase.js**: Automatically populates database on startup
- **server/src/services/cacheService.js**: Redis caching implementation (production)
- **server/src/middleware/**: Rate limiting and smart caching middleware

### Database
- Development uses in-memory MongoDB (mongodb-memory-server)
- Database is recreated and seeded on each server restart
- Pre-configured users:
  - Admin: admin@litoral.com / senha123
  - Professional: corretor@litoral.com / senha123

### API Base URL
- Development: http://localhost:5000/api
- All API routes are prefixed with `/api`

### Key Features
- Multi-role authentication system (admin, professional, particular)
- Property management with advanced search filters
- Plan management system (Bronze, Silver, Gold, etc.)
- News/blog system
- Image upload functionality
- Property request system
- Rate limiting and distributed caching (production)

### Deployment
- Docker Compose configuration available for production deployment
- Includes Redis for caching, MongoDB, Nginx for load balancing
- Supports horizontal scaling with multiple API server instances