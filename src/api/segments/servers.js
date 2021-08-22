import {apiFetch} from "../util";

const servers = {
    getServers() {
        return apiFetch("/api/servers/");
    },

    createServer(data) {
        return apiFetch("/api/servers/", data, "put");
    },

    // region Server information access methods

    getServer(serverID) {
        if (serverID) {
            const url = "/api/servers/" + serverID;
            return apiFetch(url);
        }
    },

    modifyServer(serverID, data) {
        if (serverID) {
            const url = "/api/servers/" + serverID;
            return apiFetch(url, data, "put");
        }
    },

    deleteServer(serverID) {
        if (serverID) {
            const url = "/api/servers/" + serverID;
            return apiFetch(url, null, "delete");
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
            return apiFetch(url);
        }
    },

    runUpdate(serverID) {
        if (serverID) {
            const url = "/api/servers/" + serverID + "/update";
            return apiFetch(url);
        }
    },

    runStop(serverID) {
        if (serverID) {
            const url = "/api/servers/" + serverID + "/stop";
            return apiFetch(url);
        }
    }

    //endregion
}

export default servers;