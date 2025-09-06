# Connection & Integration Documentation

## Overview
This document outlines how the client and server components integrate and communicate in the Student Council Portal application, including the full-stack architecture, data flow, and deployment setup.

## Application Architecture

### High-Level Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   React Client  │───▶│  Express Server │───▶│   PostgreSQL    │
│   (Port 5000)   │    │   (Port 3000)   │    │    Database     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │
│  Vite Dev Server│    │ Drizzle ORM +   │
│   + HMR + Proxy │    │  Authentication │
│                 │    │                 │
└─────────────────┘    └─────────────────┘
```

### Development Environment
- **Frontend**: React + Vite development server (port 5000)
- **Backend**: Express + TypeScript with hot reload (port 3000)
- **Database**: PostgreSQL with Drizzle ORM
- **Proxy**: Vite proxies `/api/*` requests to backend
- **Authentication**: JWT cookies + OTP verification

## Connection Flow

### 1. Development Server Startup
```bash
npm run dev
```

**Process**:
1. Concurrently starts both servers
2. Backend initializes database connection
3. Frontend starts with API proxy configuration
4. Hot reload enabled for both components

**Port Configuration**:
- Client: `0.0.0.0:5000` (accessible from outside container)
- Server: `localhost:3000` (internal only)
- Proxy: All `/api/*` requests → `http://localhost:3000`

### 2. Client-Server Communication

#### API Request Flow
```
Client Component → API Client → Vite Proxy → Express Server → Database
                                    ↓
              Response ← JSON Response ← Database Query Result
```

#### Authentication Flow
```
1. User enters email → POST /api/auth/send-otp
2. System sends OTP email
3. User enters OTP → POST /api/auth/verify-otp
4. Server validates OTP → Issues JWT in HTTP-only cookie
5. Subsequent requests include cookie automatically
6. Server validates JWT on protected routes
```

### 3. Database Integration

#### Schema Synchronization
```bash
# Push schema changes to database
npm run db:push

# Generate migrations (if needed)
npm run db:generate
```

**Schema Location**: `shared/schema.ts`
**Connection**: Automatic via `DATABASE_URL` environment variable

#### Data Flow
```
Component → Custom Hook → API Client → Server Route → Drizzle Query → PostgreSQL
                                                              ↓
Component ← State Update ← Response ← JSON Response ← Query Result
```

## Network Configuration

### Replit Environment Setup

#### Vite Configuration (`vite.config.ts`)
```typescript
export default defineConfig({
  server: {
    port: 5000,
    host: '0.0.0.0',        // Critical: Allows external access
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // Backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

#### Server Configuration (`server/index.ts`)
```typescript
// Server binds to localhost:3000 (internal)
const port = parseInt(process.env.API_PORT || "3000");
server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Express API Server running on port ${port}`);
});
```

### CORS & Security
- **Development**: CORS configured for localhost origins
- **Cookies**: HTTP-only, secure cookies for JWT storage
- **Rate Limiting**: Applied to authentication endpoints
- **Security Headers**: Helmet middleware for security

## Data Integration

### Shared Schema (`shared/schema.ts`)
Common TypeScript definitions used by both client and server:
```typescript
// Used by both frontend and backend
import { eventProposals, eventApprovals } from '@shared/schema';
```

### API Client (`client/src/lib/api.js`)
Centralized communication layer:
```javascript
class ApiClient {
  baseUrl = "/api";  // Proxied by Vite to backend
  
  async request(endpoint, options = {}) {
    // Handles cookies, errors, logging
  }
}
```

### Database Connection (`server/db.ts`)
```typescript
// Drizzle connection using environment variables
const db = drizzle(new Pool({
  connectionString: process.env.DATABASE_URL,
}));
```

## Development Workflow

### 1. Starting Development
```bash
# Install dependencies
npm install

# Start database (automatic in Replit)
# Database is provisioned and connected automatically

# Push database schema
npm run db:push

# Start development servers
npm run dev
```

### 2. Development Process
1. **Backend Changes**: Server auto-restarts on file changes
2. **Frontend Changes**: Hot module replacement updates browser instantly
3. **Schema Changes**: Run `npm run db:push` to sync database
4. **Environment Variables**: Use Replit secrets for sensitive data

### 3. Testing Integration
```bash
# Check server health
curl http://localhost:3000/api/health

# Check client proxy
curl http://localhost:5000/api/health

# Database connection test
npm run db:studio  # Opens Drizzle studio
```

## Production Deployment

### Build Process
```bash
# Build both client and server
npm run build

# Start production server
npm start
```

### Production Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  Static Files   │    │  Express Server │───▶│   PostgreSQL    │
│  (Served by     │◀───│  (Production)   │    │    Database     │
│   Express)      │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Production Features**:
- Static file serving via Express
- Minified and optimized assets
- Environment-based configuration
- Production database connection

## Environment Configuration

### Required Environment Variables
```bash
# Database (automatically provided by Replit)
DATABASE_URL=postgresql://...

# Authentication (set via Replit secrets)
JWT_SECRET=your-secure-random-string

# Server (optional)
NODE_ENV=development
API_PORT=3000
```

### Replit-Specific Setup
1. **Database**: Auto-provisioned PostgreSQL instance
2. **Secrets**: Managed via Replit secrets interface
3. **Networking**: Automatic port forwarding and proxy setup
4. **File System**: Shared between client and server

## Troubleshooting

### Common Connection Issues

#### 1. API Requests Failing
**Symptoms**: Client can't reach server endpoints
**Solutions**:
- Check if server is running on port 3000
- Verify Vite proxy configuration
- Ensure database is connected

#### 2. Database Connection Errors
**Symptoms**: "Database not provisioned" or connection timeouts
**Solutions**:
- Check `DATABASE_URL` environment variable
- Run `npm run db:push` to sync schema
- Verify PostgreSQL is running

#### 3. Authentication Issues
**Symptoms**: Login failures, JWT errors
**Solutions**:
- Set `JWT_SECRET` in Replit secrets
- Check cookie settings in browser
- Verify OTP email configuration

#### 4. Hot Reload Not Working
**Symptoms**: Changes not reflected automatically
**Solutions**:
- Check file watch patterns in configurations
- Restart development servers
- Clear browser cache

### Performance Issues

#### 1. Slow API Responses
**Debugging**:
```bash
# Check server logs
npm run dev  # Look at request timing logs

# Monitor database queries
npm run db:studio  # Check query performance
```

#### 2. Frontend Loading Issues
**Debugging**:
```bash
# Check Vite development server
# Look at browser network tab
# Verify asset loading
```

## Monitoring & Debugging

### Development Logs
- **Server**: Request/response timing, database queries, errors
- **Client**: API calls, authentication state changes, component renders
- **Database**: Connection status, query execution

### Debug Tools
1. **Browser DevTools**: Network tab for API calls
2. **Drizzle Studio**: Database query interface (`npm run db:studio`)
3. **Server Logs**: Console output with request details
4. **React DevTools**: Component state and props inspection

### Health Checks
```bash
# Server health
GET /api/health

# Database connection
GET /api/admins  # Requires database

# Authentication flow
POST /api/auth/send-otp  # Test OTP system
```

## Security Considerations

### Development Security
- Environment variables for sensitive data
- HTTP-only cookies for JWT storage
- Rate limiting on authentication endpoints
- Input validation on all endpoints

### Production Security
- HTTPS enforcement
- Secure cookie settings
- CORS configuration
- Security headers via Helmet

### Data Protection
- SQL injection prevention via ORM
- XSS protection in React
- CSRF protection via SameSite cookies
- Sensitive data encryption

## Integration Best Practices

### Code Organization
1. **Shared Code**: Common types and schemas in `shared/`
2. **API Layer**: Centralized in `client/src/lib/api.js`
3. **Error Handling**: Consistent across client and server
4. **Logging**: Structured logging for debugging

### Development Practices
1. **Type Safety**: TypeScript for shared interfaces
2. **Error Boundaries**: Graceful error handling
3. **Loading States**: User feedback for async operations
4. **Optimistic Updates**: Immediate UI feedback

### Performance Optimization
1. **Database Queries**: Efficient joins and indexing
2. **API Calls**: Minimized requests, proper caching
3. **Bundle Size**: Code splitting and tree shaking
4. **Network**: Compression and caching headers