# QuickErrands Zambia

A Flask-based errand delivery service API for Zambia, connecting customers with local delivery agents.

## Features

- **User Management**: Customer and agent registration with JWT authentication
- **Booking System**: Create, track, and manage delivery bookings
- **Agent Matching**: Automatic assignment of nearby available agents
- **Payment Integration**: Support for mobile money and card payments
- **Rating System**: Customer feedback and agent reputation
- **Admin Panel**: Verification, monitoring, and audit trails
- **File Uploads**: Secure image handling for proofs and profiles
- **Push Notifications**: FCM integration for real-time updates

## Project Structure

```
quickerrands/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── config.py            # Configuration management
│   ├── extensions.py        # Flask extensions setup
│   ├── models/
│   │   ├── user.py          # User and Agent models
│   │   ├── booking.py       # Booking and Proof models
│   │   ├── payment.py       # Payment model
│   │   ├── rating.py        # Rating model
│   │   └── admin_log.py     # Admin audit log model
│   ├── routes/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── bookings.py      # Booking CRUD operations
│   │   ├── agents.py        # Agent profile management
│   │   ├── admin.py         # Admin functionality
│   │   └── uploads.py       # File upload handling
│   └── services/
│       ├── pricing.py       # Distance-based pricing
│       ├── matching.py      # Agent assignment logic
│       └── notifications.py # Push notification service
├── migrations/              # Database migrations
├── uploads/                 # File storage directory
├── seed.py                  # Database seeding script
├── run.py                   # Application entry point
└── requirements.txt         # Python dependencies
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- SQLite (default) or PostgreSQL/MySQL

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quickerrands
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=your-jwt-secret-key-here
   DATABASE_URL=sqlite:///quickerrands.db
   FCM_SERVER_KEY=your-fcm-server-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```

5. **Initialize the database**
   ```bash
   python seed.py
   ```

### Running the Application

**Development mode:**
```bash
python run.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/<id>` - Get booking details
- `PUT /api/bookings/<id>/status` - Update booking status
- `POST /api/bookings/<id>/proof` - Upload delivery proof

### Agents
- `POST /api/agents/profile` - Create agent profile
- `GET /api/agents/profile` - Get agent profile
- `PUT /api/agents/profile` - Update agent profile
- `GET /api/agents/available` - Get available agents
- `PUT /api/agents/location` - Update agent location

### Admin
- `GET /api/admin/agents/pending` - Get pending agent verifications
- `PUT /api/admin/agents/<id>/verify` - Verify agent
- `PUT /api/admin/users/<id>/suspend` - Suspend user
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/logs` - Get admin action logs

### Uploads
- `POST /api/uploads/image` - Upload image file
- `GET /api/uploads/images/<filename>` - Get uploaded image

## Database Models

### User
- Basic user information (email, name, phone)
- User type (customer, agent, admin)
- Verification status

### AgentProfile
- Agent-specific information (ID, vehicle, location)
- Availability and rating data

### Booking
- Delivery details (pickup/delivery locations, items)
- Status tracking and pricing
- Agent assignment

### Payment
- Transaction details and status
- Multiple payment methods support

### Rating
- Customer feedback for completed bookings

### AdminLog
- Audit trail for administrative actions

## Services

### Pricing Service
- Distance calculation using Haversine formula
- Dynamic pricing based on distance and service fees

### Matching Service
- Automatic agent assignment based on proximity and availability
- Workload balancing

### Notifications Service
- Firebase Cloud Messaging integration
- Booking status and payment notifications

## Development

### Running Tests
```bash
pytest
```

### Database Migrations
```bash
flask db migrate
flask db upgrade
```

### Code Formatting
```bash
black .
flake8 .
```

## Deployment

### Environment Variables
Set the following environment variables for production:

- `SECRET_KEY`: Flask secret key
- `JWT_SECRET_KEY`: JWT signing key
- `DATABASE_URL`: Database connection string
- `FCM_SERVER_KEY`: Firebase Cloud Messaging key
- `STRIPE_SECRET_KEY`: Stripe payment key
- `USE_S3`: Set to True for AWS S3 file storage

### Production Server
Use a WSGI server like Gunicorn:

```bash
gunicorn -w 4 -b 0.0.0.0:8000 run:app
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.