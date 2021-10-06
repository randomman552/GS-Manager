from flask import Blueprint, request
from flask_login import login_required, current_user
from mongoengine import ValidationError, NotUniqueError

from ..models import GameServer, User, Category
from ..socketIO import socketIO
from .. import server_runner as runner
from .. import rest

servers = Blueprint("servers", __name__, static_folder="static", template_folder="templates", url_prefix="/api/servers")


# region SocketIO interaction
@socketIO.on("input", namespace="/servers")
def input_to_server(json):
    server_id = json.get("server_id")
    input_text = json.get("input_text")
    api_key = json.get("api_key")
    server = GameServer.objects(id=server_id).first()
    if server:
        api_key_user = User.objects(api_key=api_key).first()
        if api_key_user and api_key_user.is_authenticated:
            runner.run_command(input_text, server)
        if current_user.is_authenticated:
            runner.run_command(input_text, server)
# endregion


# region Server list getting and creation methods.

@servers.route("/", methods=["GET", "POST"])
@login_required
def get_servers():
    """
    Endpoint does not return server output, server must be directly queried by id to get output.
    Server output will be provided if a url argument of output=true is provided.
    """
    all_servers = GameServer.objects().all()
    servers_list = [server.to_dict(request.args.get("output", False)) for server in all_servers]

    return rest.response(200, data=servers_list)


@servers.route("/", methods=["PUT"])
@login_required
def create_server():
    data = rest.get_json_data()
    try:
        new_server = GameServer(**data)
        new_server.save()
        new_server.reload()
        new_server.create_working_directory()
        return rest.response(201, data=new_server.to_dict())
    except ValidationError as e:
        return rest.response(400, error=e.message)
    except NotUniqueError as e:
        return rest.response(400, error=str(e))


# endregion


# region Named server endpoints. E.g. specific server get and put endpoints.

@servers.route("/<server_id>", methods=["GET", "POST"])
@login_required
def server_details(server_id: str):
    """Endpoint to get details of the given server"""
    server = GameServer.objects(id=server_id).first_or_404()
    return rest.response(200, data=server.to_dict())


@servers.route("/<server_id>/output", methods=["GET", "POST"])
@login_required
def server_output(server_id: str):
    """Endpoint to get terminal output of a given server"""
    server = GameServer.objects(id=server_id).first_or_404()
    return rest.response(200, data=server.output)


@servers.route("/<server_id>", methods=["PUT"])
@login_required
def modify_server(server_id: str):
    """
    Endpoint for modifying existing servers.
    """
    server = GameServer.objects(id=server_id).first_or_404()

    if not server.is_running:
        data = rest.get_json_data()
        server.update(**data)
        server.save()
        server.reload()
        return rest.response(200, data=server.to_dict())
    return rest.response(409, error="Cannot edit server whilst it is running.")


@servers.route("/<server_id>", methods=["DELETE"])
@login_required
def delete_server(server_id: str):
    """Endpoint for deleting an existing server."""
    server = GameServer.objects(id=server_id).first_or_404()
    server.delete()
    return rest.response(200, data=server.to_dict())


# endregion


# region Server interaction endpoints. E.g. start and stop endpoints.

@servers.route("/<server_id>/command", methods=["GET", "POST"])
@login_required
def server_command(server_id: str):
    """
    Endpoint to write a cmd to the servers stdin
    """
    server = GameServer.objects(id=server_id).first_or_404()
    command = ""
    if request.method == "GET":
        command = request.args.get("command")

    elif request.method == "POST":
        json = request.get_json()
        if json:
            data = json.get("data")
            command = data.get("command")

    if command:
        if runner.run_command(command, server):
            return rest.response(200, data=server.to_dict())
        return rest.response(409, error="Server is not running")
    return rest.response(400, error="No command provided")


@servers.route("/<server_id>/start", methods=["GET", "POST"])
@login_required
def start_server(server_id: str):
    """
    Endpoint to run the server start command.
    """
    server = GameServer.objects(id=server_id).first_or_404()
    if runner.start_server(server):
        return rest.response(200, data=server.to_dict())
    return rest.response(409, error="Server is already running/updating")


@servers.route("/<server_id>/stop", methods=["GET", "POST"])
@login_required
def stop_server(server_id: str):
    """
    Endpoint to stop the server running (passes a sigterm to the process).
    """
    server = GameServer.objects(id=server_id).first_or_404()
    if runner.stop_server(server):
        # Reload server so status is up to date
        server.reload()
        return rest.response(200, data=server.to_dict())
    return rest.response(409, error="Server is not running")


@servers.route("/<server_id>/update", methods=["GET", "POST"])
@login_required
def update_server(server_id: str):
    """
    Endpoint to run the server update command.
    """
    server = GameServer.objects(id=server_id).first_or_404()
    if runner.update_server(server):
        return rest.response(200, data=server.to_dict())
    return rest.response(409, error="Server is already running/updating")

# endregion
