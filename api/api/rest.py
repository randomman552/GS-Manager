from functools import reduce
from typing import Optional, Union
from flask import request, abort


def _to_snake_case(obj: Union[str, dict, list]) -> Union[str, dict, list]:
    """
    Utility method to convert camel case strings and dicts to snake case.
    :param obj: A string or dict to convert.
    If a string is provided, it will be converted and returned.
    If a dict is provided, the keys of the dict will be converted to snake case.
    If a list is provided, this function will be applied to each element of the list.
    :return:
    """
    if isinstance(obj, str):
        return reduce(lambda x, y: x + ('_' if y.isupper() else '') + y, obj).lower()

    # For dict, apply to all keys (do not descend into nested dicts)
    elif isinstance(obj, dict):
        # Create a new dict for this (can't edit dicts while iterating over them)
        result = dict()
        for key in obj:
            result[_to_snake_case(key)] = obj.get(key)
        return result

    # For list, apply to each element in turn
    elif isinstance(obj, list):
        for i in range(len(obj)):
            obj[i] = _to_snake_case(obj[i])

    # If object is not supported, return it unedited
    return obj


def _to_camel_case(obj: Union[str, dict, list]) -> Union[str, dict, list]:
    """
    Utility method to convert snake case strings and dicts to camel case.
    :param obj: A string or dict to convert.
    If a string is provided, it will be converted and returned.
    If a dict is provided, the keys of the dict will be converted to camel case.
    If a list is provided, this function will be applied to each element of the list.
    :return:
    """
    if isinstance(obj, str):
        init, *temp = obj.split('_')
        # Dont proceed if we are not in snake case
        if not len(temp):
            return obj
        return ''.join([init.lower(), *map(str.title, temp)])

    # For dict, apply to all keys (do not descend into nested dicts)
    elif isinstance(obj, dict):
        result = dict()
        for key in obj:
            result[_to_camel_case(key)] = obj.get(key)
        return result

    # For list, apply to each element in turn
    elif isinstance(obj, list):
        for i in range(len(obj)):
            obj[i] = _to_camel_case(obj[i])

    # If object is not supported, return it unedited
    return obj


def response(code: int = 200, error: Optional[str] = None, data: Optional = None) -> tuple[dict, int]:
    """
    Utility function for generating a REST JSON response.
    All parameters should be JSON serializable, or else flask will not convert them correctly.
    :param code: The HTTP response code to return alongside the JSON
    :param error: Any error that is encountered, or null
    :param data: Any data to send to the client, or null
    :return: JSON dict and HTTP response code in tuple.
    """
    return {
        "error": error,
        "code": code,
        "data": _to_camel_case(data)
    }, code


def get_json_data() -> dict:
    """
    Utility function to get data from a rest request.
    All parameters should be JSON serializable, or else flask will not convert them correctly.
    Will raise a 400 HTTP exception if no data was provided by the request.
    Designed for use in routes where data is required.
    :return: Data if present.
    """
    json = request.get_json()
    if json:
        data = json.get("data")
        if data:
            return _to_snake_case(data)
    abort(400, "This route expects data, and none was provided")
