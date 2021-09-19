import React, {useState} from "react";
import {Card, Button} from "react-bootstrap";
import ScrollToBottom from "react-scroll-to-bottom";
import PropTypes from 'prop-types';
import {Switch, Route, Redirect, Link} from "react-router-dom";

import {deepCopy} from "../../util";
import {SendCommandForm} from "./components/SendCommandForm"
import {UpdateServerForm} from "./components/UpdateServerForm"
import {NewServerForm} from "./components/NewServerForm";
import "./ServersPage.css"
import api from "../../api/api";
import {addMessage} from "../components/MessageDisplay";


/**
 * Dashboard displayed when on a route for a given server.
 */
class ServerDashboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showSettingsModal: false
        };
    }


    get server() {
        return this.props.server;
    }


    startServer() {
        if (this.server)
            api.servers.runStart(this.server.id).then(() => {
                addMessage("Server started", "success", 5000);
            });
    }

    updateServer() {
        if (this.server)
            api.servers.runUpdate(this.server.id).then(() => {
                addMessage("Server updating", "warning", 5000);
            });
    }

    stopServer() {
        if (this.server)
            api.servers.runStop(this.server.id).then(() => {
                addMessage("Server stopped", "danger", 5000);
            });
    }


    sendCommand(data) {
        if (this.server && data.command) {
            const toSend = {
                "command": data.command
            };
            api.servers.runCommand(this.server.id, toSend).then();
        }
    }

    /**
     * Method to edit the current server with the given data.
     * @param data
     */
    modifySettings(data) {
        if (this.server) {
            api.servers.modifyServer(this.server.id, data).then(data => {
                if (data.code === 200) {
                    this.closeSettings();
                }
            });
        }
    }

    /**
     * Method to delete the current server by sending a delete request to the backend.
     */
    deleteServer() {
        if (this.server) {
            api.servers.deleteServer(this.server.id).then(data => {
                if (data.code === 200) {
                    this.render = () => {
                        return (
                            <Redirect
                                to="/servers"
                            />
                        )
                    }
                }
            });
        }
    }


    openSettings() {
        this.setState({
            showSettingsModal: true
        });
    }

    closeSettings() {
        this.setState({
            showSettingsModal: false
        });
    }


    /**
     * Method to add a new launch mode to a server
     * @param data {{name: string, arguments: string}}
     */
    addMode(data) {
        const server = this.server;
        if (server && data.name && data.arguments) {
            let mode_map = {}
            if (server.mode_map)
                mode_map = deepCopy(server.mode_map)
            mode_map[data.name] = data.arguments

            api.servers.modifyServer(server.id, {mode_map}).then();
        }
    }

    /**
     * Method to edit a launch mode.
     * @param data {{originalName: string, name: string, arguments: string}}
     */
    editMode(data) {
        const server = this.server;
        if (server && data.originalName) {
            let mode_map = {};
            if (server.mode_map)
                mode_map = deepCopy(server.mode_map);


            if (!data.name)
                data.name = data.originalName;
            if (!data.arguments)
                data.arguments = mode_map[data.originalName]

            delete mode_map[data.originalName];
            mode_map[data.name] = data.arguments;

            api.servers.modifyServer(server.id, {mode_map}).then();
        }
    }

    /**
     * Method to delete a launch mode.
     * @param data {{name: string}}
     */
    deleteMode(data) {
        const server = this.server;
        if (server && data.name) {
            let mode_map = {}
            if (server.mode_map)
                mode_map = deepCopy(server.mode_map)
            delete mode_map[data.name]

            api.servers.modifyServer(server.id, {mode_map}).then();
        }
    }


    renderSettings() {
        const show = this.state.showSettingsModal;

        return (
            <UpdateServerForm
                show={show}

                onGeneralSubmit={(data) => this.modifySettings(data)}
                onDelete={() => this.deleteServer()}

                onArgumentsSubmit={(data) => this.modifySettings(data)}

                onModeAdd={(data) => this.addMode(data)}
                onModeEdit={(data) => this.editMode(data)}
                onModeDelete={(data) => this.deleteMode(data)}

                onClose={() => this.closeSettings()}

                data={this.server}
            />
        )
    }

    renderOutputLines() {
        if (!this.server) return [];

        const output = this.server.output;

        if (output) {
            return output.map((line, lineNum) => {
                return (
                    <pre key={lineNum} className="server-console-line">
                        {line}
                    </pre>
                );
            });
        }
        return [];
    }

    render() {
        if (!this.server)
            return (
                <Redirect to="/servers"/>
            )
        const outputLines = this.renderOutputLines();
        const settingsModal = this.renderSettings();
        const running = this.server.status !== "stopped";

        return (
            <article id={this.server.name} className="server-dashboard">
                {settingsModal}
                <Card className="server-info">
                    <Card.Header className="server-info-header">{this.server.name}</Card.Header>
                    <Card.Body className="server-info-body">
                        <article className="server-console-container">
                            <ScrollToBottom
                                className="server-console"
                                scrollViewClassName="server-console-lines"
                                initialScrollBehavior="auto"
                            >
                                {outputLines}
                            </ScrollToBottom>

                            <SendCommandForm
                                key={this.server.name}
                                onSubmit={(data) => this.sendCommand(data)}
                                disabled={!running}
                            />
                        </article>
                        <article className="server-controls">
                            <h2
                                className={"text-center text-capitalize server-status " + this.server.status}
                            >
                                {this.server.status}
                            </h2>
                            <Button disabled={running} variant="success" onClick={() => this.startServer()} block>
                                Start
                            </Button>
                            <Button disabled={running} variant="warning" onClick={() => this.updateServer()} block>
                                Update
                            </Button>
                            <Button disabled={!running} variant="danger" onClick={() => this.stopServer()} block>
                                Stop
                            </Button>
                            <Button disabled={running} variant="secondary" onClick={() => this.openSettings()} block>
                                Settings
                            </Button>
                        </article>
                    </Card.Body>
                </Card>
            </article>
        );
    }
}

ServerDashboard.propTypes = {
    server: PropTypes.object.isRequired
}


/**
 * Dashboard displayed on route normal /servers route.
 */
function NoServerDashboard(props) {
    const [show, setShow] = useState(false);

    const servers = props.servers.map((server) => {
        const serverRunning = server.status !== "stopped";

        return (
            <article className="server" key={server.name}>
                <Link className="server-name" to={"/servers/" + server.id}>{server.name}</Link>
                <div className="controls">
                    <Button variant="success" disabled={serverRunning} onClick={() => {
                        api.servers.runStart(server.id).then(() => {
                            addMessage(
                                "Server '" + server.name + "' started",
                                "success",
                                5000
                            );
                        });
                    }}>
                        Start
                    </Button>
                    <Button variant="warning" disabled={serverRunning} onClick={() => {
                        api.servers.runUpdate(server.id).then(() => {
                            addMessage(
                                "Server '" + server.name + "' updating",
                                "warning",
                                5000
                            );
                        });
                    }}>
                        Update
                    </Button>
                    <Button variant="danger" disabled={!serverRunning} onClick={() => {
                        api.servers.runStop(server.id).then(() => {
                            addMessage(
                                "Server '" + server.name + "' stopped",
                                "danger",
                                5000
                            );
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
                onSubmit={(data) => {setShow(false); api.servers.createServer(data).then()}}
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

NoServerDashboard.propTypes = {
    servers: PropTypes.arrayOf(PropTypes.object).isRequired
}


export function ServersPage(props) {
    const servers = props.servers;
    const auth = props.auth;

    return (
        <article className="page">
            <Switch>
                <Route
                    path="/servers/:serverID"
                    render={(props) => {
                        const serverID = props.match.params.serverID;

                        let curServer;
                        for (const server of servers) {
                            if (server.id === serverID) {
                                curServer = server;
                                break;
                            }
                        }

                        return (
                            <ServerDashboard
                                {...props}
                                key={serverID}
                                auth={auth}
                                server={curServer}
                            />
                        )
                    }}
                />
                <Route
                    exact path="/servers"
                    render={(props) => {
                        return (<NoServerDashboard {...props} auth={auth} servers={servers} />)
                    }}
                />
            </Switch>
        </article>
    );
}

ServersPage.propTypes = {
    servers: PropTypes.array,
    auth: PropTypes.object
}

