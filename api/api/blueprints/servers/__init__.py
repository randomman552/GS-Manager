from flask import Blueprint, request, abort
from flask_login import login_required
from mongoengine import ValidationError, NotUniqueError

from ...models import GameServer
from ... import server_runner as runner
from ... import rest

servers = Blueprint("servers", __name__, static_folder="static", template_folder="templates", url_prefix="/api/servers")


# region Server list getting and creation methods.

@servers.route("/", methods=["GET", "POST"])
@login_required
def get_servers():
    all_servers = GameServer.objects().all()
    servers_list = [server.name for server in all_servers]
    return rest.response(200, data=servers_list)


@servers.route("/", methods=["PUT"])
@login_required
def create_server():
    json = request.get_json()
    if json:
        data = json.get("data")
        if data:
            try:
                new_server = GameServer(**data)
                new_server.save()
                return rest.response(201)
            except ValidationError as e:
                return rest.response(400, error=e.message)
            except NotUniqueError as e:
                return rest.response(400, error=str(e))
        return rest.response(400, error="No data provided.")

# endregion


# region Named server endpoints. E.g. specific server get and put endpoints.

@servers.route("/<name>", methods=["GET", "POST"])
@login_required
def server_details(name: str):
    server = GameServer.objects(name=name).first_or_404()

    server_dict = server.to_mongo().to_dict()
    server_dict.pop("_id")
    return rest.response(200, data=server_dict)


@servers.route("/<name>", methods=["PUT"])
@login_required
def update_server(name: str):
    """
    Endpoint for creating new servers.
    """
    server = GameServer.objects(name=name).first_or_404()
    if not server.is_running:
        json = request.get_json()
        if json:
            data = json.get("data")
            if data:
                server.update(**data)
                server.save()
                return rest.response(200, data=data)
        return rest.response(400, error="No data provided.")
    return rest.response(409, error="Cannot edit server whilst it is running.")


@servers.route("/<name>", methods=["DELETE"])
@login_required
def delete_server(name: str):
    """Endpoint for deleting an existing server."""
    server = GameServer.objects(name=name).first_or_404()
    server.delete()
    return rest.response(200)

# endregion


# region Server interaction endpoints. E.g. start and stop endpoints.

@servers.route("/<name>/command", methods=["GET", "POST"])
@login_required
def server_command(name: str):
    """
    Endpoint to write a cmd to the servers stdin
    """
    server = GameServer.objects(name=name).first_or_404()
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
            return rest.response(202)
        return rest.response(409, error="Server is not running")
    return rest.response(400, error="No command provided")


@servers.route("/<name>/start", methods=["GET", "POST"])
@login_required
def start_server(name: str):
    """
    Endpoint to run the server start command.
    """
    server = GameServer.objects(name=name).first_or_404()
    if runner.start_server(server):
        return rest.response(202)
    return rest.response(409, error="Server is already running/updating")


@servers.route("/<name>/stop", methods=["GET", "POST"])
@login_required
def stop_server(name: str):
    """
    Endpoint to stop the server running (passes a sigterm to the process).
    """
    server = GameServer.objects(name=name).first_or_404()
    if runner.stop_server(server):
        return rest.response(202)
    return rest.response(409, error="Server is not running")


@servers.route("/<name>/update", methods=["GET", "POST"])
@login_required
def run_server_update(name: str):
    """
    Endpoint to run the server update command.
    """
    server = GameServer.objects(name=name).first_or_404()
    if runner.update_server(server):
        return rest.response(202)
    return rest.response(409, error="Server is already running/updating")

# endregion
