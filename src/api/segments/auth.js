import {apiFetch, StorageCache} from "../util";

const auth = {
    cache: new StorageCache(),

    getCurrentUser() {
        return apiFetch("/api/auth/").then(data => {
            if (data.code >= 200 && data.code < 300)
                this.cache.updateObj(data.data);
            return data;
        });
    },

    // region User creation and retrieval.
    getUsers() {
        return apiFetch("/api/auth/users").then(data => {
            if (data.code >= 200 && data.code < 300)
                this.cache.fromArray(data.data);
            return data;
        });
    },

    createUser(obj) {
        return apiFetch("/api/auth/users", obj, "put").then(data => {
            if (data.code >= 200 && data.code < 300)
                this.cache.updateObj(data.data);
            return data;
        });
    },
    //endregion

    // region Specific user controls (getting, updating, and deleting specific users)
    getUser(userID) {
        if (userID) {
            const url = "/api/auth/users/" + userID;
            return apiFetch(url).then(data => {
                if (data.code >= 200 && data.code < 300)
                    this.cache.updateObj(data.data);
                return data;
            });
        }
    },

    modifyUser(userID, obj) {
        if (userID) {
            const url = "/api/auth/users/" + userID;
            return apiFetch(url, obj, "put").then(data => {
                if (data.code >= 200 && data.code < 300)
                    this.cache.updateObj(data.data);
                return data;
            });
        }
    },

    deleteUser(userID) {
        if (userID) {
            const url = "/api/auth/users/" + userID;
            return apiFetch(url, null, "delete").then(data => {
                if (data.code >= 200 && data.code < 300)
                    this.cache.deleteObj(data.data);
                return data;
            });
        }
    },
    //endregion

    // region Login and logout methods
    login(auth) {
        return apiFetch("/api/auth/login", null, "post", auth)
    },

    logout() {
        return apiFetch("/api/auth/logout")
    }
    // endregion
}

export default auth;
