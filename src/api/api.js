import auth from "./segments/auth";
import servers from "./segments/servers";
import io from "socket.io-client"

const socket = io.connect("/", {port: 5000});

setTimeout(() => {
    socket.emit("test", "message")
}, 1000)


/**
 * Object used to abstract away the querying of the backend api.
 * Contains the following api segments:
 * - auth
 * - servers
 */
const api = {
    socket,
    servers,
    auth
}

export default api;