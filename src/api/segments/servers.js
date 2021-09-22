import io from "socket.io-client"
import Resource from "../rest/Resource";
import {apiFetch, buildUrl} from "../rest/util";

const socket = io("/servers");


class ServersResource extends Resource {
    constructor() {
        super("/api/servers/");
    }

    // region Interaction endpoints
    start(id) {
        const url = buildUrl(this.baseUrl, [id, "start"]);
        return apiFetch(url).then(json => {
            if (json.success) {
                this.cache.updateObj(json.data);
            }
            return json;
        });
    }

    update(id) {
        const url = buildUrl(servers.baseUrl, [id, "update"]);
        return apiFetch(url).then(json => {
            if (json.success) {
                this.cache.updateObj(json.data);
            }
            return json;
        });
    }

    stop(id) {
        const url = buildUrl(servers.baseUrl, [id, "stop"]);
        return apiFetch(url);
    }

    /**
     * Send a command to the stdin of the given server.
     * @param id {string}
     * @param data {{command: string}}
     * @returns {Promise<*>}
     */
    sendCommand(id, data) {
        const url = buildUrl(servers.baseUrl, [id, "command"]);
        return apiFetch(url, data);
    }
    // endregion
}

const servers = new ServersResource();

// region SocketIO event handlers

socket.on("output", (json) => {
    const server = servers.cache.getObject(json.server_id);
    server.output.push(json.output);
    servers.cache.updateObj(server);
});

socket.on("status", (json) => {
    const server = servers.cache.getObject(json.server_id);
    server.status = json.status;
    servers.cache.updateObj(server);
});

// endregion


export default servers;