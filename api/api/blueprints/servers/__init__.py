from flask import Blueprint, request, abort
from flask_login import login_required
from mongoengine import ValidationError, NotUniqueError

from ...models import GameServer
from ... import server_runner as runner
from ... import rest

servers = Blueprint("servers", __name__, static_folder="static", template_folder="templates", url_prefix="/api/servers")


@servers.route("/", methods=["GET", "POST", "PUT"])
@login_required
def servers_root():
    if request.method == "PUT":
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

    all_servers = GameServer.objects().all()
    servers_list = [server.name for server in all_servers]
    return rest.response(200, data=servers_list)


@servers.route("/<name>", methods=["GET", "POST", "PUT", "DELETE"])
@login_required
def server_details(name: str):
    server = GameServer.objects(name=name).first_or_404()

    # Updating method
    if request.method == "PUT":
        json = request.get_json()
        if json:
            data = json.get("data")
            if data:
                server.update(**data)
                server.save()
                return rest.response(200, data=data)
        return rest.response(400, error="No data provided.")

    elif request.method == "DELETE":
        server.delete()
        return rest.response(200)

    server_dict = server.to_mongo().to_dict()
    server_dict.pop("_id")
    return rest.response(200, data=server_dict)


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
    server = GameServer.objects(name=name).first_or_404()
    if runner.start_server(server):
        return rest.response(202)
    return rest.response(409, error="Server is already running/updating")


@servers.route("/<name>/stop", methods=["GET", "POST"])
@login_required
def stop_server(name: str):
    server = GameServer.objects(name=name).first_or_404()
    if runner.stop_server(server):
        return rest.response(202)
    return rest.response(409, error="Server is not running")


@servers.route("/<name>/update", methods=["GET", "POST"])
@login_required
def update_server(name: str):
    server = GameServer.objects(name=name).first_or_404()
    if runner.update_server(server):
        return rest.response(202)
    return rest.response(409, error="Server is already running/updating")
