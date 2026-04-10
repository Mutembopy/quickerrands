from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.booking import Booking, BookingProof
from ..models.user import User
from ..services.pricing import calculate_price
from ..services.matching import assign_agent
from ..services.notifications import send_notification

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('', methods=['POST'])
@jwt_required()
def create_booking():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    required_fields = ['title', 'description', 'pickup_location', 'pickup_lat', 'pickup_lng',
                      'delivery_location', 'delivery_lat', 'delivery_lng']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    # Calculate distance and price
    distance = calculate_price(data['pickup_lat'], data['pickup_lng'],
                              data['delivery_lat'], data['delivery_lng'])
    estimated_price = distance * 2.5  # $2.50 per km

    # Create booking
    booking = Booking(
        customer_id=current_user_id,
        title=data['title'],
        description=data['description'],
        pickup_location=data['pickup_location'],
        pickup_lat=data['pickup_lat'],
        pickup_lng=data['pickup_lng'],
        delivery_location=data['delivery_location'],
        delivery_lat=data['delivery_lat'],
        delivery_lng=data['delivery_lng'],
        estimated_distance_km=distance,
        estimated_price=estimated_price
    )

    db.session.add(booking)
    db.session.commit()

    # Try to assign an agent automatically
    assigned_agent = assign_agent(booking.id)
    if assigned_agent:
        booking.agent_id = assigned_agent.id
        booking.status = 'accepted'
        db.session.commit()

        # Send notification to agent
        send_notification(assigned_agent.id, f"New booking assigned: {booking.title}")

    return jsonify(booking.to_dict()), 201

@bookings_bp.route('', methods=['GET'])
@jwt_required()
def get_bookings():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.user_type == 'customer':
        bookings = Booking.query.filter_by(customer_id=current_user_id).all()
    else:  # agent
        bookings = Booking.query.filter_by(agent_id=current_user_id).all()

    return jsonify([booking.to_dict() for booking in bookings]), 200

@bookings_bp.route('/<int:booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    current_user_id = get_jwt_identity()
    booking = Booking.query.get_or_404(booking_id)

    # Check if user has permission to view this booking
    if booking.customer_id != current_user_id and booking.agent_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify(booking.to_dict()), 200

@bookings_bp.route('/<int:booking_id>/status', methods=['PUT'])
@jwt_required()
def update_booking_status(booking_id):
    current_user_id = get_jwt_identity()
    booking = Booking.query.get_or_404(booking_id)
    data = request.get_json()

    if 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400

    new_status = data['status']
    valid_statuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled']

    if new_status not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400

    # Check permissions
    user = User.query.get(current_user_id)
    if user.user_type == 'customer' and booking.customer_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    elif user.user_type == 'agent' and booking.agent_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    booking.status = new_status
    db.session.commit()

    # Send notifications
    if new_status == 'completed':
        send_notification(booking.customer_id, f"Booking completed: {booking.title}")
    elif new_status == 'cancelled':
        recipient_id = booking.customer_id if user.user_type == 'agent' else booking.agent_id
        send_notification(recipient_id, f"Booking cancelled: {booking.title}")

    return jsonify(booking.to_dict()), 200

@bookings_bp.route('/<int:booking_id>/proof', methods=['POST'])
@jwt_required()
def upload_proof(booking_id):
    current_user_id = get_jwt_identity()
    booking = Booking.query.get_or_404(booking_id)

    if booking.agent_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    required_fields = ['proof_type', 'image_url']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    proof = BookingProof(
        booking_id=booking_id,
        proof_type=data['proof_type'],
        image_url=data['image_url'],
        description=data.get('description')
    )

    db.session.add(proof)
    db.session.commit()

    return jsonify(proof.to_dict()), 201