try:
    from app import create_app
    app = create_app()
except Exception as e:
    from flask import Flask
    app = Flask(__name__)

    @app.route("/")
    def error():
        return f"Startup Error: {str(e)}"
