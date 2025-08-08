# Admin Dashboard Application

## Overview

This is a modern full-stack web application built with React frontend and Express.js backend, designed as an admin dashboard for managing categories, sales, and analytics. The application features a comprehensive UI with sidebar navigation, data visualization, and CRUD operations for various content types.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **File Uploads**: Multer middleware for handling image uploads
- **Development**: Hot-reload with tsx for TypeScript execution

### Database & Storage
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Storage Strategy**: Currently using in-memory storage with MemStorage class, designed to be easily replaced with database implementation

## Key Components

### Data Models
- **Users**: Authentication and user management
- **Categories**: Hierarchical content categorization with image support
- **Sales**: Customer transaction records
- **Analytics**: Aggregated metrics and KPIs

### Frontend Features
- **Dashboard**: Analytics overview with KPI cards and revenue charts
- **Category Management**: Full CRUD operations with image upload
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Form Validation**: Type-safe forms using Zod schemas
- **File Upload**: Image upload with preview functionality

### Backend Features
- **RESTful APIs**: Comprehensive endpoints for all data operations
- **File Upload**: Image processing and storage
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Error Handling**: Centralized error handling middleware

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **API Routing**: Express.js routes handle requests and call storage layer
3. **Data Processing**: Storage layer (currently in-memory) processes CRUD operations
4. **Response**: JSON responses sent back to client
5. **State Updates**: TanStack Query manages cache invalidation and UI updates

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Database ORM and query builder
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **zod**: Runtime type validation
- **react-hook-form**: Form state management
- **wouter**: Lightweight routing
- **multer**: File upload handling

### UI Dependencies
- **@radix-ui/***: Unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **recharts**: Chart library for data visualization
- **lucide-react**: Icon library

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Hot Reload**: Automatic restart on file changes
- **Development Server**: Runs on port 5000

### Production Build
- **Frontend Build**: Vite builds optimized static assets
- **Backend Build**: esbuild bundles server code for production
- **Deployment Target**: Autoscale deployment on Replit
- **Static Assets**: Served from dist/public directory

### Environment Configuration
- **Database URL**: Required via DATABASE_URL environment variable
- **File Storage**: Local uploads directory (production would need cloud storage)
- **Build Process**: Automated via npm run build script

## Changelog

```
Changelog:
- June 25, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```