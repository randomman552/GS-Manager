import {apiFetch, StorageCache} from "../util";
import io from "socket.io-client"

const socket = io("/servers");


const servers = {
    cache: new StorageCache(),
    socket,

    // region API requests
    getServers() {
        return apiFetch("/api/servers/").then(data => {
            if (!data.error)
                this.cache.fromArray(data.data);
            return data;
        });
    },

    createServer(data) {
        return apiFetch("/api/servers/", data, "put").then(data => {
            if (!data.error)
                this.cache.updateObj(data.data)
            return data;
        });
    },

    // region Server information access methods

    getServer(serverID) {
        if (serverID) {
            const url = "/api/servers/" + serverID;
            return apiFetch(url).then(data => {
                if (!data.error)
                    this.cache.updateObj(data.data)
                return data;
            });
        }
    },

    getServerOutput(serverID) {
        if (serverID) {
            const url = "/api/servers/" + serverID;
            return apiFetch(url).then(data => {
                if (!data.error) {
                    const server = this.cache.getObject(serverID);
                    server.output = data.data;
                    this.cache.updateObj(server);
                }
                return data;
            });
        }
    },

    modifyServer(serverID, data) {
        if (serverID) {
            const url = "/api/servers/" + serverID;
            return apiFetch(url, data, "put").then(data => {
                if (!data.error)
                    this.cache.updateObj(data.data)
                return data;
            });
        }
    },

    deleteServer(serverID) {
        if (serverID) {
            const url = "/api/servers/" + serverID;
            return apiFetch(url, null, "delete").then(data => {
                if (!data.error)
                    this.cache.deleteObj(data.data)
                return data;
            });
        }
    },

    // endregion

    // region Interaction methods (for starting and stopping server)

    runCommand(serverID, data) {
        if (serverID) {
            const url = "/api/servers/" + serverID + "/command";
            return apiFetch(url, data);
        }
    },

    runStart(serverID) {
        if (serverID) {
            const url = "/api/servers/" + serverID + "/start";
            return apiFetch(url).then(data => {
                if (!data.error) {
                    const server = this.cache.getObject(serverID);
                    server.status = "started";
                    this.cache.updateObj(server);
                }
            });
        }
    },

    runUpdate(serverID) {
        if (serverID) {
            const url = "/api/servers/" + serverID + "/update";
            return apiFetch(url).then(data => {
                if (!data.error) {
                    const server = this.cache.getObject(serverID);
                    server.status = "updating";
                    this.cache.updateObj(server);
                }
            });
        }
    },

    runStop(serverID) {
        if (serverID) {
            const url = "/api/servers/" + serverID + "/stop";
            return apiFetch(url).then(data => {
                if (!data.error) {
                    const server = this.cache.getObject(serverID);
                    server.status = "stopped";
                    this.cache.updateObj(server);
                }
            });
        }
    }

    // endregion
    // endregion
}


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