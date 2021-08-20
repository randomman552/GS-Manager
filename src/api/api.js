import auth from "./segments/auth";

/**
 * Object used to abstract away the querying of the backend api.
 * Contains the following api segments:
 * - auth: Allows control over user accounts.
 */
const api = {
    auth
}

export default api;