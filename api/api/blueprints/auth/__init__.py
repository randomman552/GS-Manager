from flask import Blueprint, request
from flask_login import current_user, login_required, login_user, logout_user

from ... import rest
from ...models import User

auth = Blueprint("auth", __name__, static_folder="static", template_folder="templates", url_prefix="/api/auth")


# region User list getting and user creation endpoints

@auth.route("/", methods=["GET", "POST"])
@login_required
def current_auth():
    """
    Endpoint to return current auth details.
    """
    cur_user = current_user.to_mongo().to_dict()
    # Do not send user id or password
    cur_user.pop("_id")
    cur_user.pop("password")
    return rest.response(200, data=cur_user)


@auth.route("/users", methods=["GET", "POST"])
@login_required
def users():
    all_users = User.objects().all()
    all_users_list = [user.to_mongo().to_dict() for user in all_users]

    # Pop off unneeded attributes
    for user in all_users_list:
        user["id"] = str(user.get("_id"))
        user.pop("_id")
        user.pop("password")
        user.pop("api_key")
    return rest.response(200, data=all_users_list)


@auth.route("/users", methods=["PUT"])
@login_required
def create_user():
    """
    Route to add a new user
    """
    json = request.get_json()
    if json:
        data = json.get("data")
        if data:
            new_user = User(**data)
            new_user.save()
            return rest.response(202)
    return rest.response(400, error="No data provided.")

# endregion


# region Specific user endpoints

@auth.route("/users/<user_id>", methods=["GET", "POST"])
@login_required
def get_user(user_id: str):
    user = User.objects(id=user_id).first_or_404()
    user = user.to_mongo().to_dict()

    user["id"] = str(user.get("_id"))
    user.pop("_id")
    user.pop("password")
    user.pop("api_key")

    return rest.response(200, data=user)


@auth.route("/users/<user_id>", methods=["PUT"])
@login_required
def update_user(user_id: str):
    user = User.objects(id=user_id).first_or_404()

    json = request.get_json()
    if json:
        data = json.get("data")
        if data:
            user.update(**data)
            return rest.response(200)
    return rest.response(400, error="No data provided.")


@auth.route("/users/<user_id>", methods=["DELETE"])
@login_required
def delete_user(user_id: str):
    user = User.objects(id=user_id).first_or_404()
    user.delete()
    return rest.response(200)

# endregion


# region Login and logout endpoints

@auth.route("/login", methods=["POST"])
@login_required
def login():
    """
    This endpoint sets a cookie to allow requests to be made without providing auth.
    """
    login_user(current_user)
    return rest.response(200)


@auth.route("/logout", methods=["GET", "POST"])
def logout():
    """
    Endpoint to destroy current session cookie.
    """
    logout_user()
    return rest.response(200)

# endregion
