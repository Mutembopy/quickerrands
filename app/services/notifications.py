import requests
from flask import current_app
from ..models.user import User

def send_fcm_notification(token, title, body, data=None):
    """
    Send push notification via Firebase Cloud Messaging
    """
    fcm_url = 'https://fcm.googleapis.com/fcm/send'
    server_key = current_app.config.get('FCM_SERVER_KEY')

    if not server_key:
        current_app.logger.warning("FCM_SERVER_KEY not configured")
        return False

    headers = {
        'Authorization': f'key={server_key}',
        'Content-Type': 'application/json'
    }

    payload = {
        'to': token,
        'notification': {
            'title': title,
            'body': body,
            'sound': 'default'
        }
    }

    if data:
        payload['data'] = data

    try:
        response = requests.post(fcm_url, json=payload, headers=headers)
        response.raise_for_status()
        current_app.logger.info(f"FCM notification sent successfully to {token}")
        return True
    except requests.RequestException as e:
        current_app.logger.error(f"Failed to send FCM notification: {e}")
        return False

def send_notification(user_id, message, title="QuickErrands", data=None):
    """
    Send notification to a user
    In a real app, you'd store FCM tokens in the database
    """
    user = User.query.get(user_id)
    if not user:
        return False

    # For now, we'll simulate sending a notification
    # In production, you'd retrieve the user's FCM token from database
    # and call send_fcm_notification

    current_app.logger.info(f"Notification to {user.email}: {title} - {message}")

    # Placeholder for FCM token - in real app, this would be stored in user model
    fcm_token = getattr(user, 'fcm_token', None)

    if fcm_token:
        return send_fcm_notification(fcm_token, title, message, data)
    else:
        # For development, just log the notification
        current_app.logger.info(f"Would send notification to {user.email}: {message}")
        return True

def send_booking_notification(booking, notification_type):
    """
    Send booking-related notifications
    """
    if notification_type == 'booking_created':
        # Notify customer
        send_notification(
            booking.customer_id,
            f"Your booking '{booking.title}' has been created and is being processed.",
            "Booking Created"
        )

    elif notification_type == 'agent_assigned':
        # Notify customer
        send_notification(
            booking.customer_id,
            f"An agent has been assigned to your booking '{booking.title}'.",
            "Agent Assigned"
        )
        # Notify agent
        if booking.agent:
            send_notification(
                booking.agent_id,
                f"You have been assigned a new booking: '{booking.title}'.",
                "New Booking"
            )

    elif notification_type == 'booking_started':
        send_notification(
            booking.customer_id,
            f"Your booking '{booking.title}' is now in progress.",
            "Booking Started"
        )

    elif notification_type == 'booking_completed':
        send_notification(
            booking.customer_id,
            f"Your booking '{booking.title}' has been completed successfully.",
            "Booking Completed"
        )

    elif notification_type == 'booking_cancelled':
        # Notify both parties
        send_notification(
            booking.customer_id,
            f"Your booking '{booking.title}' has been cancelled.",
            "Booking Cancelled"
        )
        if booking.agent:
            send_notification(
                booking.agent_id,
                f"Booking '{booking.title}' has been cancelled.",
                "Booking Cancelled"
            )

def send_payment_notification(payment, notification_type):
    """
    Send payment-related notifications
    """
    if notification_type == 'payment_completed':
        send_notification(
            payment.user_id,
            f"Payment of {payment.currency} {payment.amount} has been processed successfully.",
            "Payment Completed"
        )

    elif notification_type == 'payment_failed':
        send_notification(
            payment.user_id,
            f"Payment of {payment.currency} {payment.amount} has failed. Please try again.",
            "Payment Failed"
        )