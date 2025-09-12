# Overview

This is a Student Council Portal - a full-stack web application for managing event proposals and club formation requests at a university. The application provides different access levels for administrators, coordinators, and public users to submit, review, and approve various academic activities. Built with modern web technologies, it features a dark-themed UI, real-time data management, and comprehensive approval workflows.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with dark theme design system and custom CSS variables
- **State Management**: TanStack React Query for server state and custom hooks for local state
- **Authentication**: Context-based auth system with magic link authentication via Supabase

## Backend Architecture
- **Server**: Express.js with TypeScript running on Node.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Shared TypeScript schema definitions with Zod validation
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development

## Data Storage Solutions
- **Primary Database**: PostgreSQL (configured via Neon Database serverless)
- **ORM**: Drizzle with schema migrations support
- **File Storage**: Supabase Storage for PDF documents and attachments
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple

## Authentication and Authorization
- **Magic Link Authentication**: Passwordless login via Supabase Auth
- **Role-Based Access Control**: Admin, coordinator, and public user roles
- **Protected Routes**: Context-based authentication with route protection
- **Admin User Creation**: Automated admin user provisioning via Supabase Edge Functions

## Key Features
- **Event Proposal Management**: Complete workflow for submitting, reviewing, and approving events
- **Club Formation Requests**: System for proposing new student clubs with approval tracking
- **Multi-level Approval System**: Sequential approval process for different administrator roles
- **PDF Document Handling**: Upload, storage, and viewing of proposal documents
- **Real-time Updates**: Live status updates and notifications
- **Responsive Design**: Mobile-first approach with adaptive layouts

# External Dependencies

## Third-party Services
- **Supabase**: Backend-as-a-Service for authentication, database, and file storage
- **Replit**: Development environment with integrated deployment

## Key Libraries
- **UI/UX**: Radix UI primitives, Lucide React icons, next-themes for theming
- **Forms**: React Hook Form with Hookform resolvers for validation
- **PDF Handling**: React-PDF for document viewing and manipulation
- **Date Management**: date-fns for date formatting and manipulation
- **Search**: Fuse.js for fuzzy search functionality
- **Notifications**: Sonner for toast notifications

## Development Tools
- **Build**: Vite with React plugin and TypeScript support
- **Database**: Drizzle Kit for migrations and schema management
- **Styling**: PostCSS with Tailwind CSS and Autoprefixer
- **Code Quality**: TypeScript strict mode with ESNext modules