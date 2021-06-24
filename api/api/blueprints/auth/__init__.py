from flask import Blueprint, request, abort
from flask_login import current_user, login_required

from ... import rest
from ...models import User

auth = Blueprint("auth", __name__, static_folder="static", template_folder="templates", url_prefix="/api/auth")


@auth.route("/", methods=["GET", "POST", "PUT"])
@login_required
def user():
    """
    Endpoint to get currently logged in user details.
    :return:
    """
    if request.method == "PUT":
        raise NotImplementedError()
    cur_user = current_user.to_mongo().to_dict()
    # Do not send user id or password
    cur_user.pop("_id")
    cur_user.pop("password")
    return rest.response(200, data={"user": cur_user})


@auth.route("/apikey", methods=["GET", "POST"])
@login_required
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
    return rest.response(200, data={"key": current_user.api_key})
