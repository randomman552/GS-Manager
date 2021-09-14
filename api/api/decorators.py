from functools import wraps

from flask_login import current_user
from werkzeug.exceptions import abort


def admin_required(func):
    @wraps(func)
    def decorated_view(*args, **kwargs):
        if current_user.is_admin:
            return func(*args, **kwargs)
        abort(403)
    return decorated_view
