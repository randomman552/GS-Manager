from flask import Blueprint, request, abort
from flask_login import current_user

from ... import rest
from ...models import User

auth = Blueprint("auth", __name__, static_folder="static", template_folder="templates", url_prefix="/api/auth")


@auth.route("/", methods=["GET", "PUT"])
def user():
    """
    Endpoint to get currently logged in user details.
    :return:
    """
    if request.method == "GET":
        if isinstance(current_user, User):
            cur_user = current_user.to_mongo().to_dict()
            # Do not send user id or password
            cur_user.pop("_id")
            cur_user.pop("password")
            return rest.response(200, data={"user": cur_user})
        abort(401)
    elif request.method == "PUT":
        raise NotImplementedError()


@auth.route("/apikey", methods=["GET", "POST"])
def get_api_key():
    """
    Endpoint to get an api key for the given login credentials.
    Login credentials can be provided through:
        GET request supplying username and password arguments
        POST request containing json in following structure:
            {
                "apikey": None,
                "data": {
                    "username": username,
                    "password": password
                }
            }
    :return:
    """
    if current_user.is_authenticated:
        return rest.response(200, data={"key": current_user.api_key})

    def return_key(username: str, password: str):
        if username and password:
            user = User.objects(name=username).first_or_404()
            if user.check_password(password):
                return rest.response(200, data={"key": user.api_key})
        abort(401)

    if request.method == "GET":
        return return_key(request.args.get("username", ""), request.args.get("password", ""))
    elif request.method == "POST":
        data = request.get_json().get("data", dict())
        return return_key(data.get("username", ""), data.get("password", ""))
    abort(401)
