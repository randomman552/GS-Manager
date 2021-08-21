import auth from "./segments/auth";
import servers from "./segments/servers";

/**
 * Object used to abstract away the querying of the backend api.
 * Contains the following api segments:
 * - auth: Allows control over user accounts.
 */
const api = {
    servers,
    auth
}

export default api;