# Client Documentation

## Overview
The client is a modern React application built with Vite, featuring a responsive UI for the Student Council Portal. It provides interfaces for event management, club formation, and administrative approval workflows.

## Architecture

### Tech Stack
- **Framework**: React 18 with TypeScript/JavaScript
- **Build Tool**: Vite for fast development and bundling
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: TanStack React Query + React Context
- **Routing**: React Router v7
- **Forms**: React Hook Form with validation
- **Icons**: Lucide React
- **Notifications**: Sonner toast library

### Project Structure
```
client/
├── public/               # Static assets
│   ├── favicon.ico
│   ├── student_council.jpg
│   └── robots.txt
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components (shadcn/ui)
│   │   ├── AppLayout.jsx         # Main app layout
│   │   ├── AuthProvider.jsx      # Authentication context
│   │   ├── ClubsView.jsx         # Club management view
│   │   ├── EventsView.jsx        # Event management view
│   │   ├── EventApprovalTracker.jsx  # Approval workflow
│   │   ├── EventProposalCard.jsx # Event card component
│   │   ├── LoginPage.jsx         # Authentication page
│   │   ├── MainApp.jsx           # Main application
│   │   ├── ProposalDetailsModal.jsx  # Event details modal
│   │   └── SearchInput.jsx       # Search functionality
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.js          # Authentication hook
│   │   ├── useEventProposals.js # Event data management
│   │   ├── useEventApprovals.js # Approval data management
│   │   ├── use-mobile.jsx      # Mobile detection
│   │   └── use-toast.js        # Toast notifications
│   ├── lib/             # Utility libraries
│   │   ├── api.js              # API client
│   │   └── utils.js            # General utilities
│   ├── pages/           # Page components
│   │   └── NotFound.jsx        # 404 page
│   ├── utils/           # Utility functions
│   │   ├── createAdminUsers.js # Admin setup utilities
│   │   ├── pdfUtils.js         # PDF handling
│   │   └── proposalUtils.js    # Proposal utilities
│   ├── App.jsx          # Root component
│   ├── main.jsx         # Application entry point
│   ├── index.css        # Global styles
│   └── App.css          # Component styles
└── index.html           # HTML template
```

## Running the Client

### Development Mode
```bash
# Start client only
npm run client:dev

# Start both client and server
npm run dev
```

### Build for Production
```bash
# Build client
npm run build:client

# Full production build
npm run build
```

### Development Features
- **Hot Module Replacement**: Instant updates on file changes
- **TypeScript/JSX Support**: Full TypeScript and JSX parsing
- **Proxy Setup**: API requests proxied to backend server
- **Path Aliases**: Clean imports with `@/` prefix
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Core Components

### Authentication System
**Components**: `LoginPage.jsx`, `AuthProvider.jsx`
- Magic link authentication with OTP verification
- Context-based state management
- Persistent session handling
- Role-based access control

### Event Management
**Components**: `EventsView.jsx`, `EventProposalCard.jsx`, `EventApprovalTracker.jsx`
- Event proposal listing and filtering
- Detailed event information display
- Multi-level approval workflow
- Real-time status updates

### Club Management
**Components**: `ClubsView.jsx`
- Club formation request management
- Active clubs directory
- Approval workflow for new clubs

### Admin Interface
**Components**: `EventApprovalTracker.jsx`, various admin views
- Administrative approval controls
- Comment system for rejections/approvals
- Workflow status tracking

## API Integration

### API Client (`src/lib/api.js`)
Centralized API communication with:
- Automatic error handling
- Request/response logging
- Cookie-based authentication
- Consistent error responses

#### Key Methods
```javascript
// Authentication
apiClient.sendOTP(email)
apiClient.verifyOTP(email, otp)
apiClient.getCurrentUser()
apiClient.logout()

// Events
apiClient.getEventProposals()
apiClient.getEventProposal(id)
apiClient.approveEvent(id, comments)
apiClient.rejectEvent(id, comments)

// Approvals
apiClient.getEventApprovals(eventId)
apiClient.getAdminApprovalStatus(eventId, adminEmail)
```

## State Management

### Authentication State
Managed by `AuthProvider` context:
- User authentication status
- OTP flow management
- Session persistence
- Login/logout functions

### Data State
Managed by custom hooks:
- `useEventProposals`: Event data and operations
- `useEventApprovals`: Approval workflow data
- `useAuth`: Authentication state and actions

## Styling & UI

### Design System
- **Theme**: Dark-first design with custom CSS variables
- **Colors**: Professional blue/gray palette
- **Typography**: Clean, readable font stack
- **Spacing**: Consistent spacing scale
- **Animations**: Subtle transitions and hover effects

### Component Library
Built on Shadcn/ui components:
- Consistent design language
- Accessible by default
- Customizable via Tailwind CSS
- TypeScript support

### Responsive Design
- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interface
- Optimized for various screen sizes

## Development Guidelines

### Adding New Components
1. Create component in appropriate directory
2. Use TypeScript for type safety
3. Follow naming conventions (PascalCase for components)
4. Include proper prop validation
5. Add to appropriate parent component

### API Integration
1. Always use `apiClient` from `src/lib/api.js`
2. Handle loading and error states
3. Show user feedback for actions
4. Implement proper error boundaries

### Styling Guidelines
1. Use Tailwind CSS classes
2. Maintain consistent spacing
3. Follow design system colors
4. Ensure mobile responsiveness
5. Test in dark/light modes

### State Management
1. Use React Context for global state
2. Custom hooks for data operations
3. Local state for component-specific data
4. Minimize prop drilling

## Configuration

### Vite Configuration (`vite.config.ts`)
- **Build Tool**: Optimized for development and production
- **Proxy Setup**: API requests forwarded to backend
- **Path Aliases**: Clean import paths
- **Hot Reload**: Fast development experience
- **TypeScript**: Full TypeScript support
- **JSX**: Support for both .js and .jsx files

### Tailwind Configuration (`tailwind.config.ts`)
- Custom color palette
- Dark mode support
- Component-specific utilities
- Animation configurations

## Common Issues & Solutions

### Build Errors
- **JSX in .js files**: Configured to support JSX in JavaScript files
- **TypeScript errors**: Most type errors don't prevent builds
- **Import errors**: Check path aliases and file extensions

### Development Issues
- **Hot reload not working**: Check file watch patterns
- **API errors**: Verify server is running on port 3000
- **Proxy issues**: Ensure proxy configuration matches server

### Styling Issues
- **Tailwind not working**: Check PostCSS configuration
- **Dark mode issues**: Verify theme provider setup
- **Component styling**: Check if Shadcn/ui components are properly imported

### Authentication Issues
- **Login not working**: Check if server JWT_SECRET is configured
- **Session not persisting**: Verify cookie settings
- **OTP not received**: Check server email configuration

## Performance Optimization

### Build Optimization
- Code splitting by route
- Vendor chunk separation
- Asset optimization
- Tree shaking for unused code

### Runtime Performance
- React.memo for expensive components
- Efficient state updates
- Lazy loading for heavy components
- Optimized API calls

### User Experience
- Loading states for all async operations
- Error boundaries for graceful failures
- Optimistic updates where appropriate
- Responsive design for all devices

## Testing

### Development Testing
1. Test all user flows manually
2. Verify responsive design
3. Check authentication workflows
4. Test API error scenarios
5. Validate form submissions

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement approach

## Deployment Considerations

### Environment Variables
- API endpoints configuration
- Authentication settings
- Feature flags

### Build Process
1. Run `npm run build`
2. Verify static assets
3. Test production build locally
4. Deploy to hosting platform

### Production Optimizations
- Minified JavaScript/CSS
- Compressed assets
- Cached static resources
- CDN-ready static files