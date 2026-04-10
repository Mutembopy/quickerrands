from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.user import User, AgentProfile
from ..models.admin_log import AdminLog
from ..models.booking import Booking
from ..models.payment import Payment

admin_bp = Blueprint('admin', __name__)

def require_admin():
    """Decorator to check if user is admin"""
    def decorator(f):
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if user.user_type != 'admin':
                return jsonify({'error': 'Admin access required'}), 403
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

@admin_bp.route('/agents/pending', methods=['GET'])
@require_admin()
def get_pending_agents():
    agents = AgentProfile.query.filter(
        AgentProfile.user.has(is_verified=False)
    ).all()

    result = []
    for agent in agents:
        agent_data = agent.to_dict()
        agent_data['user'] = agent.user.to_dict()
        result.append(agent_data)

    return jsonify(result), 200

@admin_bp.route('/agents/<int:agent_id>/verify', methods=['PUT'])
@require_admin()
def verify_agent(agent_id):
    current_user_id = get_jwt_identity()
    agent_profile = AgentProfile.query.get_or_404(agent_id)
    agent_profile.user.is_verified = True

    # Log the action
    log = AdminLog(
        admin_id=current_user_id,
        action='verify_agent',
        target_type='user',
        target_id=agent_profile.user_id,
        details=f'Verified agent {agent_profile.user.email}'
    )

    db.session.add(log)
    db.session.commit()

    return jsonify({'message': 'Agent verified successfully'}), 200

@admin_bp.route('/users/<int:user_id>/suspend', methods=['PUT'])
@require_admin()
def suspend_user(user_id):
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)

    # In a real app, you'd have a suspended field
    # For now, we'll just log the action
    log = AdminLog(
        admin_id=current_user_id,
        action='suspend_user',
        target_type='user',
        target_id=user_id,
        details=f'Suspended user {user.email}'
    )

    db.session.add(log)
    db.session.commit()

    return jsonify({'message': 'User suspended successfully'}), 200

@admin_bp.route('/stats', methods=['GET'])
@require_admin()
def get_stats():
    total_users = User.query.count()
    total_agents = User.query.filter_by(user_type='agent').count()
    total_customers = User.query.filter_by(user_type='customer').count()
    total_bookings = Booking.query.count()
    completed_bookings = Booking.query.filter_by(status='completed').count()
    total_payments = Payment.query.filter_by(payment_status='completed').count()

    return jsonify({
        'total_users': total_users,
        'total_agents': total_agents,
        'total_customers': total_customers,
        'total_bookings': total_bookings,
        'completed_bookings': completed_bookings,
        'total_payments': total_payments
    }), 200

@admin_bp.route('/logs', methods=['GET'])
@require_admin()
def get_admin_logs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)

    logs = AdminLog.query.order_by(AdminLog.created_at.desc()).paginate(
        page=page, per_page=per_page
    )

    result = []
    for log in logs.items:
        log_data = log.to_dict()
        log_data['admin'] = log.admin.to_dict()
        result.append(log_data)

    return jsonify({
        'logs': result,
        'total': logs.total,
        'pages': logs.pages,
        'current_page': page
    }), 200