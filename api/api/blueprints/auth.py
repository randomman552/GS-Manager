from flask import Blueprint, request, abort
from flask_login import current_user, login_required, login_user, logout_user

from .. import rest
from ..models import User
from ..decorators import admin_required

auth = Blueprint("auth", __name__, static_folder="static", template_folder="templates", url_prefix="/api/auth")


# region User list getting and user creation endpoints

@auth.route("/", methods=["GET", "POST"])
@login_required
def current_auth():
    """
    Endpoint to return current auth details.
    """
    return rest.response(200, data=current_user.to_dict())


@auth.route("/users", methods=["GET", "POST"])
@login_required
def users():
    all_users = User.objects().all()
    all_users_list = [user.to_dict() for user in all_users]
    return rest.response(200, data=all_users_list)


@auth.route("/users", methods=["PUT"])
@login_required
@admin_required
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
            new_user.reload()
            return rest.response(201, data=new_user.to_dict())
    return rest.response(400, error="No data provided.")

# endregion


# region Specific user endpoints

@auth.route("/users/<user_id>", methods=["GET", "POST"])
@login_required
def get_user(user_id: str):
    user = User.objects(id=user_id).first_or_404()
    return rest.response(200, data=user.to_dict())


@auth.route("/users/<user_id>", methods=["PUT"])
@login_required
@admin_required
def modify_user(user_id: str):
    user = User.objects(id=user_id).first_or_404()

    json = request.get_json()
    if json:
        data = json.get("data")
        if data:
            # If current working on an admin user
            # And there is only one admin user
            # Prevent removal of only admin
            if user.is_admin and len(User.objects(is_admin=True)) == 1:
                if not data.get("is_admin", True):
                    abort(400, "Cannot remove only admin")

            user.update(**data)
            user.reload()
            return rest.response(200, data=user.to_dict())
    abort(400, "JSON provided was empty")


@auth.route("/users/<user_id>", methods=["DELETE"])
@login_required
def delete_user(user_id: str):
    user = User.objects(id=user_id).first_or_404()

    # Prevent removal of only admin
    if user.is_admin and len(User.objects(is_admin=True)) == 1:
        abort(400, "Cannot remove only admin")

    user.delete()
    return rest.response(200, data=user.to_dict())

# endregion


# region Login and logout endpoints

@auth.route("/login", methods=["GET", "POST"])
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
