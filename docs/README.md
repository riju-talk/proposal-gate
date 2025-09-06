# Student Council Portal Documentation

## Quick Start

### Running the Application
```bash
# Install dependencies
npm install

# Start both client and server
npm run dev
```

The application will be available at the Replit preview URL (port 5000).

## Documentation Structure

### 📖 [Server Documentation](./server.md)
Complete guide to the backend Express.js application:
- API endpoints and routes
- Database schema and operations
- Authentication and security
- Development and deployment

### 🎨 [Client Documentation](./client.md)
Complete guide to the frontend React application:
- Component architecture
- State management
- UI components and styling
- Development workflow

### 🔌 [Connection & Integration](./connection.md)
How the client and server work together:
- Network configuration
- API communication
- Database integration
- Troubleshooting guide

## Application Overview

### What is this?
The Student Council Portal is a full-stack web application for managing:
- **Event Proposals**: Submit and review academic events
- **Club Formation**: Request new student clubs
- **Approval Workflows**: Multi-level administrative approval process
- **User Management**: Role-based access control

### Technology Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Shadcn/ui
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: JWT + OTP verification
- **Development**: Hot reload for both client and server

### Key Features
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Real-time Updates**: Instant feedback on actions
- ✅ **Secure Authentication**: OTP-based login system
- ✅ **Role-based Access**: Admin and public user roles
- ✅ **Approval Workflows**: Multi-step approval process
- ✅ **Dark Theme**: Professional dark-themed UI

## Development Environment

### Prerequisites
- Node.js 20+ (automatically provided in Replit)
- PostgreSQL database (automatically provisioned)

### Environment Setup
1. **Database**: Automatically connected via `DATABASE_URL`
2. **Secrets**: Set `JWT_SECRET` via Replit secrets
3. **Development**: Hot reload enabled for both client and server

### Development Scripts
```bash
# Start full development environment
npm run dev

# Individual components
npm run server:dev  # Backend only
npm run client:dev  # Frontend only

# Database operations
npm run db:push     # Sync schema with database
npm run db:studio   # Open database admin interface

# Production build
npm run build       # Build for production
npm start           # Run production server
```

## Quick Troubleshooting

### Application Won't Start
1. Check if all dependencies are installed: `npm install`
2. Verify database is connected: Check for database connection logs
3. Ensure JWT_SECRET is set in Replit secrets

### Frontend Issues
1. **JSX Errors**: Vite is configured to handle JSX in .js files
2. **API Errors**: Verify server is running on port 3000
3. **Build Errors**: Check browser console for specific errors

### Backend Issues
1. **Database Errors**: Run `npm run db:push` to sync schema
2. **Authentication Errors**: Verify JWT_SECRET is configured
3. **Port Conflicts**: Server uses port 3000, client uses port 5000

### Common Solutions
```bash
# Reset development environment
npm run reset

# Force database schema sync
npm run db:push --force

# Clear Vite cache
rm -rf node_modules/.vite && npm run dev
```

## Architecture Summary

```
┌─────────────────────────────────────┐
│           User Interface            │
│         (React + Vite)              │
│           Port 5000                 │
└──────────────┬──────────────────────┘
               │ HTTP Requests (/api/*)
               ▼
┌─────────────────────────────────────┐
│        Express Server              │
│     (TypeScript + Node.js)         │
│           Port 3000                 │
└──────────────┬──────────────────────┘
               │ SQL Queries
               ▼
┌─────────────────────────────────────┐
│       PostgreSQL Database          │
│      (Drizzle ORM + Schema)        │
└─────────────────────────────────────┘
```

## Security Features
- **OTP Authentication**: Email-based one-time passwords
- **JWT Tokens**: Secure session management
- **HTTP-only Cookies**: Protected token storage
- **Rate Limiting**: Prevents authentication abuse
- **SQL Injection Protection**: Parameterized queries via ORM
- **CORS Configuration**: Proper cross-origin handling

## Performance Optimizations
- **Hot Module Replacement**: Instant development updates
- **Code Splitting**: Optimized bundle loading
- **Database Indexing**: Efficient query performance
- **API Caching**: Reduced redundant requests
- **Asset Optimization**: Minified production builds

## Support

### Getting Help
1. Check the specific documentation files for detailed information
2. Review error logs in the development console
3. Use the troubleshooting guides in each documentation section
4. Check browser developer tools for client-side issues

### Development Best Practices
- Always use the API client (`src/lib/api.js`) for server communication
- Follow the established component patterns for UI development
- Use `npm run db:push` for any database schema changes
- Test both client and server after making changes
- Keep environment variables secure and properly configured

---

**Last Updated**: September 2025  
**Application Version**: 1.0.0  
**Documentation Status**: Complete