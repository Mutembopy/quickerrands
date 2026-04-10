from .. import db
from datetime import datetime
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # 'customer' or 'agent'
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    bookings = db.relationship('Booking', backref='customer', lazy=True, foreign_keys='Booking.customer_id')
    agent_bookings = db.relationship('Booking', backref='agent', lazy=True, foreign_keys='Booking.agent_id')
    payments = db.relationship('Payment', backref='user', lazy=True)
    ratings_given = db.relationship('Rating', backref='customer', lazy=True, foreign_keys='Rating.customer_id')
    ratings_received = db.relationship('Rating', backref='agent', lazy=True, foreign_keys='Rating.agent_id')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'user_type': self.user_type,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class AgentProfile(db.Model):
    __tablename__ = 'agent_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    id_number = db.Column(db.String(20), unique=True, nullable=False)
    id_photo_url = db.Column(db.String(255))
    vehicle_type = db.Column(db.String(50))  # motorcycle, bicycle, car
    license_plate = db.Column(db.String(20))
    is_available = db.Column(db.Boolean, default=True)
    current_location_lat = db.Column(db.Float)
    current_location_lng = db.Column(db.Float)
    rating_average = db.Column(db.Float, default=0.0)
    total_ratings = db.Column(db.Integer, default=0)
    total_jobs_completed = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = db.relationship('User', backref=db.backref('agent_profile', uselist=False))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'id_number': self.id_number,
            'id_photo_url': self.id_photo_url,
            'vehicle_type': self.vehicle_type,
            'license_plate': self.license_plate,
            'is_available': self.is_available,
            'current_location_lat': self.current_location_lat,
            'current_location_lng': self.current_location_lng,
            'rating_average': self.rating_average,
            'total_ratings': self.total_ratings,
            'total_jobs_completed': self.total_jobs_completed,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }