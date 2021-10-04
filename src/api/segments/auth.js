import {apiFetch, buildUrl} from "../rest/util";
import Resource from "../rest/Resource";

class UsersResource extends Resource {
    constructor() {
        super("/api/auth/users");
    }

    getCurrentUser() {
        return apiFetch("/api/auth/").then(json => {
            if (json.success)
                this.cache.updateObj(json.data);
            return json;
        });
    }

    modifyCurrentUser(data) {
        return apiFetch("/api/auth/", data, "put").then(json => {
            if (json.success)
                this.cache.updateObj(json.data);
            return json;
        });
    }

    deleteCurrentUser() {
        return apiFetch("/api/auth/", null, "delete").then(json => {
            if (json.success)
                this.cache.deleteObj(json.data);
            return json;
        });
    }

    login(auth) {
        return apiFetch(buildUrl("/api/auth/", "login"), null, "post", auth).then(json => {
            if (json.success) {
                this.cache.addObj(json.data);
                console.log(json)
            }
            return json;
        });
    }

    logout() {
        return apiFetch(buildUrl("/api/auth/", "logout"))
    }
}

const auth = new UsersResource();

export default auth;
