import React, {useState} from "react";
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";
import api from "../../../api/api";
import {addMessage} from "../../components/MessageDisplay";
import {NewServerForm} from "./NewServerForm";
import PropTypes from "prop-types";


/**
 * Dashboard displayed on route normal /servers route.
 */
export function ServerListing(props) {
    const [show, setShow] = useState(false);

    const servers = props.servers.map((server) => {
        const serverRunning = server.status !== "stopped";

        return (
            <article className="server" key={server.name}>
                <Link className="server-name" to={"/servers/" + server.id}>{server.name}</Link>
                <div className="controls">
                    <Button variant="success" disabled={serverRunning} onClick={() => {
                        api.servers.start(server.id).then((json) => {
                            if (json.success) {
                                addMessage(
                                    "Server '" + server.name + "' started",
                                    "success",
                                    5000
                                );
                            }
                        });
                    }}>
                        Start
                    </Button>
                    <Button variant="warning" disabled={serverRunning} onClick={() => {
                        api.servers.update(server.id).then((json) => {
                            if (json.success) {
                                addMessage(
                                    "Server '" + server.name + "' updating",
                                    "warning",
                                    5000
                                );
                            }
                        });
                    }}>
                        Update
                    </Button>
                    <Button variant="danger" disabled={!serverRunning} onClick={() => {
                        api.servers.stop(server.id).then((json) => {
                            if (json.success) {
                                addMessage(
                                    "Server '" + server.name + "' stopped",
                                    "danger",
                                    5000
                                );
                            }
                        });
                    }}>
                        Stop
                    </Button>
                </div>
                <Link className={"server-status " + server.status} to={"/servers/" + server.id}>{server.status}</Link>
            </article>
        );
    })

    return (
        <div className="server-dashboard">
            <NewServerForm
                show={show}
                setShow={(show) => setShow(show)}
                onSubmit={(data) => {
                    setShow(false);
                    api.servers.create(data).then()
                }}
            />
            <article className="servers-grid">
                {servers}
                <article className="server new-server" onClick={() => setShow(true)}>
                    <div className="plus">+</div>
                    <p>Add new server</p>
                </article>
            </article>
        </div>
    );
}

ServerListing.propTypes = {
    servers: PropTypes.arrayOf(PropTypes.object).isRequired
}
