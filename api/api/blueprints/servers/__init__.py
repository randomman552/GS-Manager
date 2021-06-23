from flask import Blueprint
from ...models import GameServer
from ... import rest

servers = Blueprint("servers", __name__, static_folder="static", template_folder="templates", url_prefix="/api/servers")


@servers.route("/")
def list_servers():
    all_servers = GameServer.objects().all()
    servers_list = [server.name for server in all_servers]
    return rest.response(200, data={"servers": servers_list})


@servers.route("/<name>")
def server_details(name: str):
    server = GameServer.objects().first_or_404()
    server = server.to_mongo().to_dict()
    server.pop("_id")
    return rest.response(200, data=server)


@servers.route("/<name>/start")
def start_server(name: str):
    server = GameServer.objects(name=name).first_or_404()
    server.start()
    return rest.response(200)


@servers.route("/<name>/stop")
def stop_server(name: str):
    server = GameServer.objects(name=name).first_or_404()
    server.stop()
    return rest.response(200)


@servers.route("/<name>/update")
def update_server(name: str):
    server = GameServer.objects(name=name).first_or_404()
    server.run_update()
    return rest.response(200)
