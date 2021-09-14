from flask import Blueprint

from .. import rest

errors = Blueprint("errors", __name__, static_folder="static", template_folder="templates")


error_codes = [
    400, 401, 403, 404, 405, 406, 408, 409, 418, 429,
    500, 501, 502, 503
]

# Generate error handlers for each error code we need to handle
# This saves us from writing a function manually for each one
# This is just so all codes return a response in json
for error_code in error_codes:
    exec(f"""
@errors.app_errorhandler({error_code})
def error_{error_code}_handler(error):
    return rest.response({error_code}, error=str(error))
    """)
