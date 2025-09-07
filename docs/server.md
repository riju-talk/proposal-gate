# Server Documentation

## Overview
The server is a Node.js application built with Express.js and TypeScript, providing REST API endpoints for the Student Council Portal application.

## Architecture

### Tech Stack
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with HTTP-only cookies + OTP verification
- **File Storage**: Document handling for PDF uploads
- **Environment**: Node.js 20+ with ES modules

### Project Structure
```
server/
├── index.ts              # Main application entry point
├── routes.ts              # API route definitions
├── db.ts                  # Database connection setup
├── auth.ts                # OTP authentication logic
├── jwt.ts                 # JWT token management
├── middleware.ts          # Authentication & security middleware
├── vite.ts                # Development server integration
├── middleware/
│   └── auth.ts           # Route-level auth middleware
└── services/
    ├── auth.ts           # Authentication services
    ├── email.ts          # Email sending functionality
    ├── jwt.ts            # JWT utilities
    └── otp.ts            # OTP generation & verification
```

## Running the Server

### Development Mode
```bash
# Start server only
npm run server:dev

# Start both server and client
npm run dev

# Optional: Start server with embedded Vite (single process)
npm run dev:integrated
```

### Environment Variables
Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for signing JWT tokens
- `NODE_ENV` - Set to 'development' for dev mode
- `API_PORT` - Server port (default: 3000)
- `INTEGRATED_DEV` - Set to `true` only if you want the server to embed Vite (use `npm run dev:integrated`)

### Development Features
- **Hot Reload**: Server automatically restarts on file changes
- **Database Integration**: Connected to PostgreSQL with schema sync
- **CORS Configuration**: Properly configured for cross-origin requests
- **Security Middleware**: Rate limiting, helmet, and security headers
- **Logging**: Comprehensive request/response logging

## API Endpoints

### Authentication Routes
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Event Management Routes
- `GET /api/events` - Get all events (filtered by user role)
- `GET /api/events/:id` - Get specific event with approvals
- `PATCH /api/events/:id/approve` - Approve event (admin only)
- `PATCH /api/events/:id/reject` - Reject event (admin only)
- `PATCH /api/events/:id/review` - Mark for review (admin only)

### Approval Routes
- `GET /api/event-proposals/:id/approvals` - Get event approvals

### Club Management Routes
- `GET /api/clubs` - Get all active clubs
- `GET /api/club-formation-requests` - Get club formation requests
- `PATCH /api/clubs/:id/approve` - Approve club formation
- `PATCH /api/clubs/:id/reject` - Reject club formation

### Admin Routes
- `GET /api/admins` - Get authorized admins list

### Health Check
- `GET /api/health` - Server health status

## Database Schema

### Core Tables
1. **event_proposals** - Event submission data
2. **event_approvals** - Approval workflow tracking
3. **authorized_admins** - Admin user management
4. **club_formation_requests** - Club creation requests
5. **clubs** - Active clubs registry

### Authentication Tables
1. **auth.otp_verifications** - OTP verification records
2. **auth.user_sessions** - Active user sessions
3. **profiles** - User profile information

## Security Features

### Authentication Flow
1. User enters email
2. System sends OTP to email
3. User verifies OTP
4. System issues JWT token in HTTP-only cookie
5. Subsequent requests authenticated via cookie

### Authorization Levels
- **Public**: Can view approved events and clubs
- **Admin**: Can approve/reject events and clubs
- **Developer**: System administrator role

### Security Middleware
- Rate limiting on OTP endpoints
- CORS protection
- Security headers (helmet)
- Request validation
- SQL injection prevention via ORM

## Development Guidelines

### Adding New Routes
1. Define route in `server/routes.ts`
2. Add middleware as needed (auth, validation)
3. Implement database queries using Drizzle ORM
4. Add proper error handling
5. Test with various user roles

### Database Changes
1. Update schema in `shared/schema.ts`
2. Run `npm run db:push` to sync with database
3. Never manually write SQL migrations

### Error Handling
- All routes include try-catch blocks
- Consistent error response format
- Detailed logging for debugging
- User-friendly error messages

## Common Issues & Solutions

### JWT Secret Missing
- Add JWT_SECRET via environment variable
- Use a strong, random string (32+ characters)

### Port & Proxy
- API server runs on port `3000`
- Client dev server runs on port `5000` and proxies `/api` to `http://localhost:3000`
- In integrated mode, the Express process mounts Vite as middleware for the SPA

### TypeScript Errors
- Most type errors don't prevent runtime execution
- Focus on fixing actual runtime errors first
- Use `npm run check` to verify TypeScript compilation

## Monitoring & Logs

### Development Logs
- Request/response logging enabled
- Database connection status
- Error stack traces
- Authentication events

### Performance Considerations
- Database queries are optimized with joins
- Minimal middleware stack
- Efficient session management
- Proper indexing on frequently queried fields