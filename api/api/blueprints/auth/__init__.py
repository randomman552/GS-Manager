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


@auth.route("/api-key", methods=["GET"])
def get_api_key():
    """
    Endpoint to get an api key for the given login credentials.
    Login credentials can be provided through request.forms or request.args
    :return:
    """
    if current_user.is_authenticated:
        return rest.response(200, data={"key": current_user.api_key})

    # Attempt to get credentials from form first, then args
    username = request.form.get("username", request.args.get("username", ""))
    password = request.form.get("password", request.args.get("password", ""))
    if username and password:
        user = User.objects(name=username).first_or_404()
        return rest.response(200, data={"key": user.api_key})
    abort(401)
