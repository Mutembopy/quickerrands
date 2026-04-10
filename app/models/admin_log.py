from .. import db
from datetime import datetime

class AdminLog(db.Model):
    __tablename__ = 'admin_logs'

    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)  # verify_agent, suspend_user, etc.
    target_type = db.Column(db.String(50), nullable=False)  # user, booking, payment
    target_id = db.Column(db.Integer, nullable=False)
    details = db.Column(db.Text)  # JSON string with action details
    ip_address = db.Column(db.String(45))  # IPv4/IPv6
    user_agent = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    admin = db.relationship('User', backref='admin_logs')

    def to_dict(self):
        return {
            'id': self.id,
            'admin_id': self.admin_id,
            'action': self.action,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'details': self.details,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'created_at': self.created_at.isoformat()
        }