import {apiFetch} from "../../util";

const auth = {
    getCurrentUser() {
        return apiFetch("/api/auth/");
    },

    // region User creation and retrieval.
    getUsers() {
        return apiFetch("/api/auth/users");
    },

    createUser(obj) {
        return apiFetch("/api/auth/users", obj, "put");
    },
    //endregion

    // region Specific user controls (getting, updating, and deleting specific users)
    getUser(userID) {
        const url = "/api/auth/users/" + userID;
        return apiFetch(url);
    },

    updateUser(userID, obj) {
        const url = "/api/auth/users/" + userID;
        return apiFetch(url, obj, "put");
    },

    deleteUser(userID) {
        const url = "/api/auth/users/" + userID;
        return apiFetch(url,null, "delete");
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
