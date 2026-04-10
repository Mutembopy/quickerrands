from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import uuid
from werkzeug.utils import secure_filename
# from PIL import Image  # Temporarily disabled
# import boto3  # For AWS S3, or use local storage  # Temporarily disabled

uploads_bp = Blueprint('uploads', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file_locally(file, filename):
    """Save file to local uploads directory"""
    upload_folder = current_app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)

    # Resize image if too large
    try:
        img = Image.open(file_path)
        if img.size[0] > 1024 or img.size[1] > 1024:
            img.thumbnail((1024, 1024))
            img.save(file_path)
    except Exception as e:
        current_app.logger.warning(f"Could not resize image: {e}")

    return f"/uploads/{filename}"

def save_file_to_s3(file, filename):
    """Save file to AWS S3 (placeholder implementation)"""
    # This would require AWS credentials and boto3 setup
    # For now, return a placeholder URL
    return f"https://s3.amazonaws.com/your-bucket/{filename}"

@uploads_bp.route('/image', methods=['POST'])
@jwt_required()
def upload_image():
    current_user_id = get_jwt_identity()

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    # Generate unique filename
    original_filename = secure_filename(file.filename)
    file_extension = original_filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_extension}"

    try:
        # Choose storage method based on configuration
        if current_app.config.get('USE_S3', False):
            file_url = save_file_to_s3(file, unique_filename)
        else:
            file_url = save_file_locally(file, unique_filename)

        return jsonify({
            'message': 'File uploaded successfully',
            'file_url': file_url,
            'filename': unique_filename
        }), 201

    except Exception as e:
        current_app.logger.error(f"File upload failed: {e}")
        return jsonify({'error': 'File upload failed'}), 500

@uploads_bp.route('/images/<filename>', methods=['GET'])
def get_image(filename):
    """Serve uploaded images"""
    upload_folder = current_app.config['UPLOAD_FOLDER']
    file_path = os.path.join(upload_folder, filename)

    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404

    from flask import send_from_directory
    return send_from_directory(upload_folder, filename)