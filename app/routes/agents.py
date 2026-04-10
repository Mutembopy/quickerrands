from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.user import User, AgentProfile
from ..services.notifications import send_notification

agents_bp = Blueprint('agents', __name__)

@agents_bp.route('/profile', methods=['POST'])
@jwt_required()
def create_agent_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)

    if user.user_type != 'agent':
        return jsonify({'error': 'Only agents can create profiles'}), 403

    if user.agent_profile:
        return jsonify({'error': 'Agent profile already exists'}), 400

    data = request.get_json()
    required_fields = ['id_number', 'vehicle_type']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    profile = AgentProfile(
        user_id=current_user_id,
        id_number=data['id_number'],
        id_photo_url=data.get('id_photo_url'),
        vehicle_type=data['vehicle_type'],
        license_plate=data.get('license_plate')
    )

    db.session.add(profile)
    db.session.commit()

    return jsonify(profile.to_dict()), 201

@agents_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_agent_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)

    if user.user_type != 'agent':
        return jsonify({'error': 'Only agents have profiles'}), 403

    if not user.agent_profile:
        return jsonify({'error': 'Agent profile not found'}), 404

    return jsonify(user.agent_profile.to_dict()), 200

@agents_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_agent_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)

    if user.user_type != 'agent':
        return jsonify({'error': 'Only agents can update profiles'}), 403

    if not user.agent_profile:
        return jsonify({'error': 'Agent profile not found'}), 404

    data = request.get_json()
    profile = user.agent_profile

    # Update fields
    if 'vehicle_type' in data:
        profile.vehicle_type = data['vehicle_type']
    if 'license_plate' in data:
        profile.license_plate = data['license_plate']
    if 'is_available' in data:
        profile.is_available = data['is_available']
    if 'current_location_lat' in data and 'current_location_lng' in data:
        profile.current_location_lat = data['current_location_lat']
        profile.current_location_lng = data['current_location_lng']

    db.session.commit()

    return jsonify(profile.to_dict()), 200

@agents_bp.route('/available', methods=['GET'])
@jwt_required()
def get_available_agents():
    # Only customers should see available agents
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.user_type != 'customer':
        return jsonify({'error': 'Unauthorized'}), 403

    agents = AgentProfile.query.filter_by(is_available=True).all()
    result = []

    for agent in agents:
        agent_data = agent.to_dict()
        agent_data['user'] = agent.user.to_dict()
        result.append(agent_data)

    return jsonify(result), 200

@agents_bp.route('/location', methods=['PUT'])
@jwt_required()
def update_location():
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)

    if user.user_type != 'agent':
        return jsonify({'error': 'Only agents can update location'}), 403

    if not user.agent_profile:
        return jsonify({'error': 'Agent profile not found'}), 404

    data = request.get_json()
    if 'lat' not in data or 'lng' not in data:
        return jsonify({'error': 'Latitude and longitude are required'}), 400

    user.agent_profile.current_location_lat = data['lat']
    user.agent_profile.current_location_lng = data['lng']
    db.session.commit()

    return jsonify({'message': 'Location updated successfully'}), 200