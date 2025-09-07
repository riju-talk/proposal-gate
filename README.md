# IIIT Delhi Student Council Portal

A comprehensive web application for managing student council events, clubs, and proposals with approval workflows.

## Features

- **Event Proposal Management**: Complete workflow for submitting, reviewing, and approving events
- **Club Formation Requests**: System for proposing new student clubs with approval tracking
- **Multi-level Approval System**: Sequential approval process for different administrator roles
- **PDF Document Handling**: Upload, storage, and viewing of proposal documents
- **Real-time Updates**: Live status updates and notifications
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS with dark theme
- Shadcn/ui components
- TanStack React Query

### Backend
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- Authentication via JWT (HTTP-only cookies) + Email OTP verification
- Nodemailer for sending OTP emails

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Gmail account for SMTP (or other email service)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd student-council-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- Database connection string
- SMTP configuration

### Database Setup

#### Option 1: Local PostgreSQL

1. Create a PostgreSQL database
2. Update `DATABASE_URL` in `.env`
3. Run migrations:
```bash
npm run db:push
```

### Development

Start the development server:
```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:3000`
- Frontend dev server on `http://localhost:5000` (proxies `/api` to the backend)

### Production Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # React components
│       ├── hooks/          # Custom React hooks (Auth, data fetching)
│       ├── lib/            # API client and utilities
│       └── utils/          # Helper functions
├── server/                 # Backend Express application
│   ├── index.ts            # Server entrypoint
│   ├── routes.ts           # API routes
│   ├── vite.ts             # Vite integration for integrated dev/prod static
│   ├── db.ts               # Database connection
│   ├── services/           # Auth/email/JWT services
│   └── middleware/         # Security/auth middleware
├── shared/                 # Shared types and database schema
│   └── schema.ts           # Drizzle ORM schema definitions
└── docs/                   # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login

### Event Proposals
- `GET /api/event-proposals` - Get all proposals (admin)
- `GET /api/event-proposals/public` - Get approved proposals (public)
- `GET /api/event-proposals/coordinator` - Get proposals (coordinator)
- `POST /api/event-proposals` - Create new proposal
- `PATCH /api/event-proposals/:id/status` - Update proposal status

### Club Management
- `GET /api/clubs` - Get all clubs
- `GET /api/club-formation-requests` - Get formation requests
- `POST /api/club-formation-requests` - Create formation request
- `PATCH /api/club-formation-requests/:id` - Update request status

## User Roles

- **Public**: View approved events and clubs
- **Coordinator**: View pending and approved proposals
- **Admin**: Full access to manage all proposals and approvals

## Admin Users

The system includes predefined admin roles:
- President Student Council
- Vice-President Student Council  
- Treasurer Student Council
- SA Office Admin
- Faculty Advisor
- Final Approver

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details