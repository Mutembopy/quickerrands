from app import create_app, db
from app.models.user import User, AgentProfile
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.rating import Rating

def seed_database():
    app = create_app()

    with app.app_context():
        # Create all tables
        db.create_all()

        # Create admin user
        admin = User(
            email='admin@quickerrands.com',
            first_name='Admin',
            last_name='User',
            phone='+260123456789',
            user_type='admin',
            is_verified=True
        )
        admin.set_password('admin123')
        db.session.add(admin)

        # Create sample customers
        customers = [
            {
                'email': 'john.doe@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'phone': '+260987654321',
                'user_type': 'customer',
                'is_verified': True
            },
            {
                'email': 'jane.smith@example.com',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'phone': '+260876543210',
                'user_type': 'customer',
                'is_verified': True
            }
        ]

        for customer_data in customers:
            customer = User(**customer_data)
            customer.set_password('password123')
            db.session.add(customer)

        # Create sample agents
        agents_data = [
            {
                'user': {
                    'email': 'agent1@quickerrands.com',
                    'first_name': 'Mike',
                    'last_name': 'Johnson',
                    'phone': '+260112233445',
                    'user_type': 'agent',
                    'is_verified': True
                },
                'profile': {
                    'id_number': 'ID001',
                    'vehicle_type': 'motorcycle',
                    'license_plate': 'ABC123',
                    'is_available': True,
                    'current_location_lat': -15.3875,
                    'current_location_lng': 28.3228,
                    'rating_average': 4.5,
                    'total_ratings': 10,
                    'total_jobs_completed': 25
                }
            },
            {
                'user': {
                    'email': 'agent2@quickerrands.com',
                    'first_name': 'Sarah',
                    'last_name': 'Williams',
                    'phone': '+260556677889',
                    'user_type': 'agent',
                    'is_verified': True
                },
                'profile': {
                    'id_number': 'ID002',
                    'vehicle_type': 'bicycle',
                    'is_available': True,
                    'current_location_lat': -15.3875,
                    'current_location_lng': 28.3228,
                    'rating_average': 4.8,
                    'total_ratings': 15,
                    'total_jobs_completed': 30
                }
            }
        ]

        for agent_data in agents_data:
            user = User(**agent_data['user'])
            user.set_password('password123')
            db.session.add(user)
            db.session.flush()  # Get user ID

            profile = AgentProfile(user_id=user.id, **agent_data['profile'])
            db.session.add(profile)

        # Create sample bookings
        bookings_data = [
            {
                'customer_id': 2,  # John Doe
                'agent_id': 4,     # Mike Johnson
                'title': 'Document Delivery',
                'description': 'Deliver important documents to client office',
                'pickup_location': 'Lusaka Central Business District',
                'pickup_lat': -15.3875,
                'pickup_lng': 28.3228,
                'delivery_location': 'Arcades Shopping Mall',
                'delivery_lat': -15.4067,
                'delivery_lng': 28.2858,
                'estimated_distance_km': 5.2,
                'estimated_price': 13.0,
                'actual_price': 13.0,
                'status': 'completed'
            },
            {
                'customer_id': 3,  # Jane Smith
                'agent_id': 5,     # Sarah Williams
                'title': 'Grocery Shopping',
                'description': 'Pick up groceries from Shoprite and deliver to home',
                'pickup_location': 'Shoprite Manda Hill',
                'pickup_lat': -15.3875,
                'pickup_lng': 28.3228,
                'delivery_location': 'Olympia Park',
                'delivery_lat': -15.4067,
                'delivery_lng': 28.2858,
                'estimated_distance_km': 3.8,
                'estimated_price': 9.5,
                'status': 'in_progress'
            }
        ]

        for booking_data in bookings_data:
            booking = Booking(**booking_data)
            db.session.add(booking)

        # Create sample payments
        payments_data = [
            {
                'booking_id': 1,
                'user_id': 2,
                'amount': 13.0,
                'currency': 'ZMW',
                'payment_method': 'mobile_money',
                'payment_status': 'completed',
                'transaction_id': 'TXN001',
                'payment_provider': 'airtel_money'
            }
        ]

        for payment_data in payments_data:
            payment = Payment(**payment_data)
            db.session.add(payment)

        # Create sample ratings
        ratings_data = [
            {
                'booking_id': 1,
                'customer_id': 2,
                'agent_id': 4,
                'rating': 5,
                'comment': 'Excellent service! Very reliable and fast delivery.'
            }
        ]

        for rating_data in ratings_data:
            rating = Rating(**rating_data)
            db.session.add(rating)

        # Commit all changes
        db.session.commit()

        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()