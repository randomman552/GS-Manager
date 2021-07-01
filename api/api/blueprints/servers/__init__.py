from flask import Blueprint, request
from flask_login import login_required

from ...models import GameServer
from ... import rest

servers = Blueprint("servers", __name__, static_folder="static", template_folder="templates", url_prefix="/api/servers")


@servers.route("/", methods=["GET", "POST"])
@login_required
def list_servers():
    all_servers = GameServer.objects().all()
    servers_list = [server.name for server in all_servers]
    return rest.response(200, data=servers_list)


@servers.route("/<name>", methods=["GET", "POST", "PUT"])
@login_required
def server_details(name: str):
    if request.method == "PUT":
        raise NotImplementedError("Altering of server settings not yet supported.")
    server = GameServer.objects(name=name).first_or_404()
    server_dict = server.to_mongo().to_dict()
    server_dict.pop("_id")
    return rest.response(200, data=server_dict)


@servers.route("/<name>/command", methods=["GET", "POST"])
@login_required
def server_command(name: str):
    """
    Endpoint to write a command to the servers stdin
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
        if server.run_command(command):
            return rest.response(202)
        return rest.response(409, error="Server is not running")
    return rest.response(400, error="No command provided")


@servers.route("/<name>/start", methods=["GET", "POST"])
@login_required
def start_server(name: str):
    server = GameServer.objects(name=name).first_or_404()
    if server.run_start():
        return rest.response(202)
    return rest.response(409, error="Server is already running/updating")


@servers.route("/<name>/stop", methods=["GET", "POST"])
@login_required
def stop_server(name: str):
    server = GameServer.objects(name=name).first_or_404()
    if server.stop():
        return rest.response(202)
    return rest.response(409, error="Server is not running")


@servers.route("/<name>/update", methods=["GET", "POST"])
@login_required
def update_server(name: str):
    server = GameServer.objects(name=name).first_or_404()
    if server.run_update():
        return rest.response(202)
    return rest.response(409, error="Server is already running/updating")
