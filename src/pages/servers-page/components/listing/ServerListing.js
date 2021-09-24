import React, {useState} from "react";
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";
import api from "../../../../api/api";
import {addMessage} from "../../../components/MessageDisplay";
import {NewServerForm} from "./NewServerForm";
import PropTypes from "prop-types";
import {NewCategoryForm} from "./NewCategoryForm";
import {ConfirmDeleteModal} from "../../../components/ConfirmDeleteModal";


/**
 * Component to represent a server in a grid format.
 */
function ServerDetails(props) {
    const server = props.server;
    const serverRunning = server.status !== "stopped";

        return (
            <article className="server">
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
}

ServerDetails.propTypes = {
    server: PropTypes.object.isRequired
}


/**
 * Component to represent a category.
 * A category is a group of servers which will be displayed using the ServerDetails component.
 */
function CategoryListing(props) {
    // Show variable has 3 states, "", "new", and "delete"
    // This alternates between the ConfirmDelete modal, NewServerForm modal, and no modal.
    const [show, setShow] = useState("");
    let categoryHeader = (props.category) ? (
            <header className="category-header">
                <h2>{props.category.name}</h2>
                <div className="options">
                    <Button
                        variant="link"
                        disabled={!props.category}
                        onClick={() => setShow("edit")}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="link"
                        disabled={!props.category}
                        onClick={() => setShow("delete")}
                    >
                        Delete
                    </Button>
                </div>
            </header>
    ) : null;

    const serverObjs = props.servers.filter((server) => {
        if (props.category)
            return server.category === props.category.id;
        return !server.category;
    });

    let servers = serverObjs.map((server) => {
        return (<ServerDetails server={server} key={server.id} />);
    });

    return (
        <article className="servers-grid">
            <NewServerForm
                show={show === "new"}
                setShow={(show) => {
                    setShow((show) ? "new" : "")
                }}
                onSubmit={(data) => {
                    setShow("");
                    if (props.category)
                        data.category = props.category.id;
                    api.servers.create(data).then()
                }}
            />
            <ConfirmDeleteModal
                show={show === "delete"}
                onCancel={() => setShow("")}
                onHide={() => setShow("")}
                onConfirm={() => {
                    api.categories.delete(props.category.id).then();
                }}
            />
            {categoryHeader}
            {servers}
            <article className="server new-server" onClick={() => setShow("new")}>
                <div className="plus">+</div>
                <p>Add new server</p>
            </article>
        </article>
    )
}

CategoryListing.propTypes = {
    category: PropTypes.object.isRequired,
    servers: PropTypes.arrayOf(PropTypes.object).isRequired
}


/**
 * Dashboard displayed on normal /servers route.
 */
export function ServerListing(props) {
    const [show, setShow] = useState(false);

    const categories = props.categories.map((category) => {
        return (<CategoryListing servers={props.servers} category={category} key={category.id}/>);
    });
    categories.unshift(<CategoryListing category={null} servers={props.servers} key="unassigned"/>)

    return (
        <div className="server-dashboard">
            <NewCategoryForm
                show={show}
                setShow={setShow}
                onSubmit={(data) => {
                    setShow(false);
                    api.categories.create(data).then();
                }}
            />
            <article className="categories-grid">
                {categories}
                <header className="category-header">
                    <Button
                        variant="link"
                        onClick={() => {setShow(true)}}
                    >
                        Add New Category
                    </Button>
                </header>
            </article>
        </div>
    );
}

ServerListing.propTypes = {
    servers: PropTypes.arrayOf(PropTypes.object).isRequired,
    categories: PropTypes.arrayOf(PropTypes.object).isRequired
}
