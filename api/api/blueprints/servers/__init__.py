from flask import Blueprint
from flask_login import login_required

from ...models import GameServer
from ... import rest

servers = Blueprint("servers", __name__, static_folder="static", template_folder="templates", url_prefix="/api/servers")


@servers.route("/", methods=["GET", "POST"])
@login_required
def list_servers():
    all_servers = GameServer.objects().all()
    servers_list = [server.name for server in all_servers]
    return rest.response(200, data={"servers": servers_list})


@servers.route("/<name>", methods=["GET", "POST"])
@login_required
def server_details(name: str):
    server = GameServer.objects(name=name).first_or_404()
    server = server.to_mongo().to_dict()
    server.pop("_id")
    return rest.response(200, data=server)


@servers.route("/<name>/start", methods=["GET", "POST"])
@login_required
def start_server(name: str):
    server = GameServer.objects(name=name).first_or_404()
    if server.run_start():
        return rest.response(202)
    return rest.response(400, error="Server is already running/updating")


@servers.route("/<name>/stop", methods=["GET", "POST"])
@login_required
def stop_server(name: str):
    server = GameServer.objects(name=name).first_or_404()
    if server.stop():
        return rest.response(202)
    return rest.response(400, error="Server is not running")


@servers.route("/<name>/update", methods=["GET", "POST"])
@login_required
def update_server(name: str):
    server = GameServer.objects(name=name).first_or_404()
    if server.run_update():
        return rest.response(202)
    return rest.response(400, error="Server is already running/updating")
