from flask import Blueprint, request
from flask_login import current_user, login_required

from ... import rest

auth = Blueprint("auth", __name__, static_folder="static", template_folder="templates", url_prefix="/api/auth")


@auth.route("/", methods=["GET", "POST", "PUT"])
@login_required
def user():
    """
    Endpoint to get currently logged in user details.
    """
    if request.method == "PUT":
        raise NotImplementedError()
    cur_user = current_user.to_mongo().to_dict()
    # Do not send user id or password
    cur_user.pop("_id")
    cur_user.pop("password")
    return rest.response(200, data=cur_user)


@auth.route("/apikey", methods=["GET", "POST"])
@login_required
def get_api_key():
    """
    Endpoint to get an api key for the given login credentials.
    Login is handled by the login_required decorator.
    """
    return rest.response(200, data=current_user.api_key)
