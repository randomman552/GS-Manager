import auth from "./segments/auth";
import servers from "./segments/servers";
import categories from "./segments/categories";


/**
 * Object used to abstract away the querying of the backend api.
 * Contains the following api segments:
 * - auth
 * - servers
 */
const api = {
    servers,
    auth,
    categories
}

export default api;