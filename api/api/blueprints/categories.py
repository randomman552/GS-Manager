from flask import Blueprint
from flask_login import login_required
from mongoengine import ValidationError, NotUniqueError

from .. import rest
from ..models import Category

categories = Blueprint("categories", __name__, url_prefix="/api/category")


@categories.route("/", methods=["GET", "POST"])
@login_required
def get_categories():
    all_categories = Category.objects().all()
    category_dicts = [category.to_dict() for category in all_categories]
    return rest.response(200, data=category_dicts)


@categories.route("/", methods=["PUT"])
@login_required
def create_category():
    data = rest.get_json_data()
    try:
        new_category = Category(**data)
        new_category.save()
        new_category.reload()
        return rest.response(201, data=new_category.to_dict())
    except ValidationError as e:
        return rest.response(400, error=e.message)
    except NotUniqueError:
        return rest.response(400, error="Category name already in use")


@categories.route("/<category_id>", methods=["GET", "POST"])
@login_required
def get_category(category_id):
    category = Category.objects(id=category_id).first_or_404()
    return rest.response(200, data=category.to_dict())


@categories.route("/<category_id>", methods=["PUT"])
@login_required
def modify_category(category_id):
    category = Category.objects(id=category_id).first_or_404()
    data = rest.get_json_data()
    category.update(**data)
    category.save()
    category.reload()
    return rest.response(200, data=category.to_dict())


@categories.route("<category_id>", methods=["DELETE"])
@login_required
def delete_category(category_id):
    category = Category.objects(id=category_id).first_or_404()
    category.delete()
    return rest.response(200, data=category.to_dict())
