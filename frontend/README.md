# QuickErrands Zambia - React Frontend

A beautiful, mobile-first React frontend for the QuickErrands Zambia platform.

## Features

- **Role-based Interface**: Separate dashboards for customers, agents, and admins
- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Real-time Updates**: Live notifications and status updates
- **Interactive Components**: Smooth animations and transitions
- **Demo Data**: Pre-populated with sample data for testing

## Tech Stack

- **React 18** - Modern React with hooks
- **CSS-in-JS** - Inline styles for component styling
- **Google Fonts** - DM Sans font family
- **Mobile Responsive** - Works on all screen sizes

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # Main HTML template
│   └── manifest.json       # PWA manifest (optional)
├── src/
│   ├── App.jsx             # Main application component
│   ├── index.js            # React entry point
│   └── api.js              # API integration (to be created)
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- The Flask backend running (see backend README)

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd quickerrands/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Features Overview

### Customer Interface
- **Service Selection**: Choose from 6 errand categories
- **Booking Flow**: 3-step booking process with location, scheduling, and confirmation
- **Booking Management**: View all bookings with status tracking
- **Agent Profiles**: View agent details and ratings
- **Rating System**: Rate completed services

### Agent Interface
- **Job Dashboard**: View available and assigned jobs
- **Job Management**: Accept, complete, and track jobs
- **Profile Management**: Update availability and view stats
- **Earnings Tracking**: Monitor completed jobs and ratings

### Admin Interface
- **Dashboard Overview**: Platform statistics and metrics
- **Agent Verification**: Approve/reject agent applications
- **User Management**: View and manage all users
- **Booking Oversight**: Monitor all platform bookings

## API Integration

To connect to the Flask backend, create an `api.js` file in the `src` directory:

```javascript
const API_BASE = 'http://localhost:5000/api';

// Authentication
export const authAPI = {
  login: (credentials) => fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }),
  register: (userData) => fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
};

// Bookings
export const bookingsAPI = {
  getBookings: (token) => fetch(`${API_BASE}/bookings`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  createBooking: (bookingData, token) => fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData)
  })
};

// Add more API functions as needed...
```

## Component Architecture

### Core Components
- **App**: Main application with routing and state management
- **LoginScreen**: Role selection and authentication
- **Header**: Navigation and branding
- **BottomNav**: Mobile navigation tabs

### Page Components
- **CustomerHome**: Service selection and overview
- **CustomerBookings**: Booking list and management
- **AgentDashboard**: Job management interface
- **AdminDashboard**: Administrative controls

### UI Components
- **Card**: Reusable card component
- **Btn**: Styled button with variants
- **Badge**: Status indicators
- **Modal**: Overlay dialogs
- **Avatar**: User profile images
- **Input**: Form input fields

## Styling

The app uses a consistent design system:

- **Colors**: Primary blue (#2563eb), accent cyan (#0891b2), success green, warning/danger colors
- **Typography**: DM Sans font family with various weights
- **Spacing**: Consistent padding and margins
- **Shadows**: Subtle box shadows for depth
- **Animations**: Smooth transitions and hover effects

## Mobile Optimization

- **Viewport Meta Tag**: Proper mobile viewport setup
- **Touch-Friendly**: Large touch targets (44px minimum)
- **Responsive Grid**: Flexible layouts that work on all screens
- **Swipe Gestures**: Natural mobile interactions
- **Performance**: Optimized for mobile networks

## Development

### Adding New Features

1. **Create Component**: Add new component in appropriate section
2. **Update State**: Modify state management in App.jsx
3. **Add Styling**: Use consistent theme colors and spacing
4. **Test Mobile**: Ensure mobile responsiveness

### Code Style

- **ES6+ Features**: Modern JavaScript with arrow functions and destructuring
- **Component Composition**: Break down complex components
- **Inline Styles**: CSS-in-JS for component-scoped styling
- **Accessibility**: Semantic HTML and ARIA attributes

## Deployment

### Static Hosting

The built app can be deployed to any static hosting service:

```bash
npm run build
# Upload the 'build' folder to your hosting provider
```

### Integration with Backend

For production deployment:

1. Update API_BASE URL to production backend
2. Configure CORS in Flask backend
3. Set up HTTPS for secure communication
4. Implement proper error handling

## Contributing

1. Follow the existing code style
2. Test on multiple devices
3. Ensure accessibility compliance
4. Add proper error handling
5. Update documentation

## License

This project is part of the QuickErrands Zambia platform.