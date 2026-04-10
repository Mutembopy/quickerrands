from .. import db
from datetime import datetime

class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    pickup_location = db.Column(db.String(255), nullable=False)
    pickup_lat = db.Column(db.Float, nullable=False)
    pickup_lng = db.Column(db.Float, nullable=False)
    delivery_location = db.Column(db.String(255), nullable=False)
    delivery_lat = db.Column(db.Float, nullable=False)
    delivery_lng = db.Column(db.Float, nullable=False)
    estimated_distance_km = db.Column(db.Float)
    estimated_price = db.Column(db.Float)
    actual_price = db.Column(db.Float)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, in_progress, completed, cancelled
    scheduled_time = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    proofs = db.relationship('BookingProof', backref='booking', lazy=True, cascade='all, delete-orphan')
    payment = db.relationship('Payment', backref='booking', uselist=False)

    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'agent_id': self.agent_id,
            'title': self.title,
            'description': self.description,
            'pickup_location': self.pickup_location,
            'pickup_lat': self.pickup_lat,
            'pickup_lng': self.pickup_lng,
            'delivery_location': self.delivery_location,
            'delivery_lat': self.delivery_lat,
            'delivery_lng': self.delivery_lng,
            'estimated_distance_km': self.estimated_distance_km,
            'estimated_price': self.estimated_price,
            'actual_price': self.actual_price,
            'status': self.status,
            'scheduled_time': self.scheduled_time.isoformat() if self.scheduled_time else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class BookingProof(db.Model):
    __tablename__ = 'booking_proofs'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    proof_type = db.Column(db.String(20), nullable=False)  # pickup, delivery, item_condition
    image_url = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'proof_type': self.proof_type,
            'image_url': self.image_url,
            'description': self.description,
            'uploaded_at': self.uploaded_at.isoformat()
        }