import auth from "./segments/auth";
import servers from "./segments/servers";
import categories from "./segments/categories";
import system from "./segments/system";


/**
 * Object used to abstract away the querying of the backend api.
 * Contains the following api segments:
 * - auth
 * - servers
 */
const api = {
    servers,
    auth,
    categories,
    system
}

export default api;