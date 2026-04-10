def create_app(config_class=Config):
    from flask import Flask
    app = Flask(__name__)
    return app
