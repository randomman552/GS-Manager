from typing import Optional


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
