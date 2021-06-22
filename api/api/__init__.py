import json
import sys
import os

from flask import Flask, Request
from flask_login import LoginManager
from flask_mongoengine import MongoEngine

from .blueprints import *
from .models import User
from . import rest

app = Flask(__name__)
config_path = os.path.join(app.root_path, "config.json")


# region Load config
def load_config(app):
    try:
        app.config.from_json(config_path)
        return False
    except FileNotFoundError:
        config = {
            "MONGODB_SETTINGS": {
                "host": "mongodb://localhost:27017/gsmanager?authSource=gsmanager"
            },
            "SECRET_KEY": os.urandom(24).hex()
        }
        save_config(config)
        return True


def save_config(config: dict):
    with open(config_path, "w") as file:
        json.dump(config, file, indent=4)


if load_config(app):
    sys.exit(f"Created config file: {config_path}")
# endregion


# region MongoEngine setup
db = MongoEngine()
db.init_app(app)
# endregion


# region Initialise database with default values (admin account and permissions)
def populate_database():
    def create_users():
        new_user = User()
        new_user.name = "admin"
        new_user.password = "password"
        new_user.save()

    create_users()
    print("Database population complete!")


if len(User.objects().all()) == 0:
    populate_database()
# endregion


# region Login setup
login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.request_loader
def load_user_from_request(request: Request):
    api_key = request.headers.get("x-api-key", request.args.get("api-key", ""))

    if api_key:
        return User.objects(api_key=api_key).first()


@login_manager.user_loader
def load_user(api_key):
    return User.objects(api_key=api_key).first()
# endregion


# region Register routes/blueprints
app.register_blueprint(auth)


# region Error handlers
@app.errorhandler(400)
def error_400(error):
    error = str(error)
    return rest.response(400, error)


@app.errorhandler(401)
def error_401(error):
    error = str(error)
    return rest.response(401, error)


@app.errorhandler(404)
def error_404(error):
    error = str(error)
    return rest.response(404, error)
# endregion
# endregion

