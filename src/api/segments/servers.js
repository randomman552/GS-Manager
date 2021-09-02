import {apiFetch, StorageCache} from "../util";

const servers = {
    cache: new StorageCache(),

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

    // endregion
    // endregion
}

export default servers;