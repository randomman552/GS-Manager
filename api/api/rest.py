from typing import Optional
from flask import request, abort


def response(code: int = 200, error: Optional[str] = None, data: Optional = None) -> tuple[dict, int]:
    """
    Helper function for generating a REST JSON response.
    :param code: The HTTP response code to return alongside the JSON
    :param error: Any error that is encountered, or null
    :param data: Any data to send to the client, or null MUST BE JSON SERIALIZABLE
    :return: JSON dict and HTTP response code in tuple.
    """
    return {
        "error": error,
        "code": code,
        "data": data
    }, code


def get_json_data() -> dict:
    """
    Utility function to get data from a rest request.
    Will raise a 400 HTTP exception if data was not presented.
    Designed for use in routes where data is required.
    :return: Data if present.
    """
    json = request.get_json()
    if json:
        data = json.get("data")
        if data:
            return data
    abort(400, "This route expects data, and none was provided")
