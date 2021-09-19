import json
import sys
import os

from flask import Flask, Request
from flask_login import LoginManager
from flask_mongoengine import MongoEngine
from mongoengine import Q

from .models import User, AnonymousUser, GameServer
from . import server_runner as runner
from .socketIO import socketIO
from . import rest

from .blueprints import auth_bp, servers_bp, errors_bp

# region Config loading functions
config_path = os.path.join(os.getcwd(), "storage/config.json")


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
    os.makedirs(config_path)
    with open(config_path, "w") as file:
        json.dump(config, file, indent=4)

# endregion


app = Flask(__name__)
if load_config(app) or "--config-only" in sys.argv:
    sys.exit(f"Created config file: {config_path}")

socketIO.init_app(app)


# region MongoEngine setup
db = MongoEngine()
db.init_app(app)
# endregion


# region Initialise database with default values (admin account)

if len(User.objects(is_admin=True).all()) == 0:
    new_user = User()
    new_user.name = "admin"
    new_user.password = "password"
    new_user.is_admin = True
    new_user.save()
    print("Database population complete!")

# endregion


# region Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.anonymous_user = AnonymousUser


@login_manager.request_loader
def load_user_from_request(request: Request):
    if request.method == "GET" or request.method == "HEAD":
        api_key = request.args.get("apikey", "")
        if api_key:
            return User.objects(api_key=api_key).first()

        username = request.args.get("username", "")
        password = request.args.get("password", "")
        if username and password:
            user = User.objects(name=username).first()
            if user is not None and user.check_password(password):
                return user
    else:
        if request.get_json():
            data = request.get_json().get("auth", dict())
            if not data:
                return None

            api_key = data.get("apikey", "")
            if api_key:
                return User.objects(api_key=api_key).first()

            username = data.get("username", "")
            password = data.get("password", "")
            if username and password:
                user = User.objects(name=username).first()
                if user is not None and user.check_password(password):
                    return user
    return None


@login_manager.user_loader
def load_user(api_key):
    return User.objects(api_key=api_key).first()
# endregion


# region Register routes/blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(servers_bp)
app.register_blueprint(errors_bp)
# endregion


# region Start any servers that should already be started
def start_servers():
    to_start = GameServer.objects.filter(Q(status="updating") | Q(status="started")).all()
    for server in to_start:
        if server.status == "updating":
            server.status = "stopped"
            server.save()
        else:
            runner.start_server(server)


start_servers()
# endregion
