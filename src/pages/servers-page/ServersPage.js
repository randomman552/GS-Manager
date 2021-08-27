import React from "react";
import {Card, Button} from "react-bootstrap";
import ScrollToBottom from "react-scroll-to-bottom";
import PropTypes from 'prop-types';
import {Switch, Route, Redirect} from "react-router-dom";

import {Navigation, ServerNavigation} from "../components/Navigation";
import {deepCopy} from "../../util";
import {SendCommandForm} from "./components/SendCommandForm"
import {UpdateServerForm} from "./components/UpdateServerForm"
import {NewServerForm} from "./components/NewServerForm";
import "./ServersPage.css"
import api from "../../api/api";


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
            api.servers.runStart(this.server.id).then();
    }

    updateServer() {
        if (this.server)
            api.servers.runUpdate(this.server.id).then()
    }

    stopServer() {
        if (this.server)
            api.servers.runStop(this.server.id).then()
    }


    sendCommand(data) {
        if (this.server && data.command) {
            const toSend = {
                "command": data.command
            };
            api.servers.runCommand(toSend).then();
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
                <NoServerDashboard/>
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
                            <Button disabled={running} variant="success" onClick={() => this.startServer()}>
                                Start
                            </Button>

                            <Button disabled={running} variant="warning" onClick={() => this.updateServer()}>
                                Update
                            </Button>

                            <Button disabled={!running} variant="danger" onClick={() => this.stopServer()}>
                                Stop
                            </Button>

                            <Button disabled={running} variant="secondary" onClick={() => this.openSettings()}>
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
class NoServerDashboard extends React.Component {
    render() {
        return (
            <div className="server-dashboard">
                <NewServerForm onSubmit={(data) => api.servers.createServer(data)} />
            </div>
        );
    }
}


export function ServersPage(props) {
    const servers = props.servers;
    const user = props.user;
    const onLogout = props.onLogout;
    const auth = props.auth;

    return (
        <article className="page">
            <Navigation
                activeKey="/servers"
                user={user}
                onLogout={onLogout}
            />
            <ServerNavigation
                servers={servers}
            />
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
                        return (<NoServerDashboard {...props} auth={auth} />)
                    }}
                />
            </Switch>
        </article>
    );
}

ServersPage.propTypes = {
    servers: PropTypes.array,
    user: PropTypes.object,
    onLogout: PropTypes.func.isRequired,
    auth: PropTypes.object
}

