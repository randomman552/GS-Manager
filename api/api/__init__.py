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

from .blueprints import auth_bp, servers_bp, errors_bp, categories_bp, system_bp

# region Config loading
storage_path = os.getenv("GSM_STORAGE_PATH", os.path.join(os.getcwd(), "storage"))
config_path = os.path.join(storage_path, "config.json")
print(f"Storage path is: {storage_path}")


def load_config_from_env() -> dict:
    """Function to get all variables we need from environment variables"""
    config = {}
    keys = ["MONGODB_HOST"]
    for key in keys:
        if value := os.getenv(key):
            config[key] = value
    return config


def load_config() -> dict:
    try:
        with open(config_path, "r") as f:
            config = json.load(f)
            return config | load_config_from_env()
    except FileNotFoundError:
        config = {
            "MONGODB_HOST": "localhost:27017/gsmanager",
            "SECRET_KEY": os.urandom(24).hex()
        }
        config |= load_config_from_env()
        return save_config(config)


def save_config(config: dict) -> dict:
    try:
        os.makedirs(storage_path)
    except FileExistsError:
        pass
    with open(config_path, "w") as file:
        json.dump(config, file, indent=4)
    return config

# endregion


app = Flask(__name__)
app.config.from_mapping(load_config())

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
    def get_with_vars(obj, variations):
        """
        Utility method to call .get with multiple variations.
        :param obj: The object to call the .get method on
        :param variations: The variations to call .get with
        :return:
        """
        for key in variations:
            if key in obj:
                return obj.get(key, None)
        return None

    api_key_variations = ["apikey", "apiKey", "api_key"]

    if request.method == "GET" or request.method == "HEAD":
        api_key = get_with_vars(request.args, api_key_variations)
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

            api_key = get_with_vars(data, api_key_variations)
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
app.register_blueprint(categories_bp)
app.register_blueprint(system_bp)
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
