from flask import Flask

try:
    from app import create_app
    app = create_app()

except Exception as e:
    app = Flask(__name__)

    @app.route("/")
    def error():
        return f"CRASH: {str(e)}"
