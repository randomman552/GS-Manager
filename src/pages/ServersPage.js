import React from "react";
import {Card, Button} from "react-bootstrap";
import ScrollToBottom from "react-scroll-to-bottom";
import PropTypes from 'prop-types';
import {Switch, Route} from "react-router-dom";

import {Navigation} from "./components";
import {apiFetch} from "../util";
import {SendCommandForm} from "./forms/servers-page/SendCommandForm"
import {UpdateServerForm} from "./forms/servers-page/UpdateServerForm"
import {NewServerForm} from "./forms/servers-page/NewServerForm";
import "./styles/ServersPage.css"


/**
 * Dashboard displayed when on a route for a given server.
 */
class ServerDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.match.params.serverName,
            server: {
                name: props.match.params.serverName,
                output: []
            },
            showSettingsModal: false
        };
    }

    getServer() {
        const name = this.state.name;
        if (name) {
            const queryUrl = "/api/servers/" + this.state.name;
            const auth = this.props.auth;

            apiFetch(auth, null, queryUrl).then((data) => {
                this.setState({
                    server: data.data
                })
            });
        }
    }

    componentDidMount() {
        this.getServer();
        this.interval = setInterval(() => this.getServer(), 500);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    startServer() {
        const name = this.state.name;
        if (name) {
            const queryUrl = "/api/servers/" + this.state.name + "/start";
            const auth = this.props.auth;
            apiFetch(auth, null, queryUrl).then(r => {});
        }
    }

    updateServer() {
        const name = this.state.name;
        if (name) {
            const queryUrl = "/api/servers/" + this.state.name + "/update";
            const auth = this.props.auth;
            apiFetch(auth, null, queryUrl).then(r => {});
        }
    }

    stopServer() {
        const name = this.state.name;
        if (name) {
            const queryUrl = "/api/servers/" + this.state.name + "/stop";
            const auth = this.props.auth;

            apiFetch(auth, null, queryUrl).then(r => {});
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

    sendCommand(data) {
        const name = this.state.name;
        if (name && data.command) {
            const queryUrl = "/api/servers/" + this.state.name + "/command";
            const auth = this.props.auth;
            const toSend = {
                "command": data.command
            };

            apiFetch(auth, toSend, queryUrl).then(r => {});
        }
    }

    /**
     * Method to edit the current server with the given data.
     * @param data
     */
    modifySettings(data) {
        const name = this.state.name;
        if (name) {
            const queryUrl = "/api/servers/" + this.state.name;
            const auth = this.props.auth;

            apiFetch(auth, data, queryUrl, "put").then(data => {
                if (data.code === 200) {
                    this.closeSettings();
                }
                // TODO: Redirect to new page on name change
            });
        }
    }

    renderSettings() {
        const show = this.state.showSettingsModal;

        return (
            <UpdateServerForm
                show={show}
                onSubmit={(data) => this.modifySettings(data)}
                onClose={() => this.closeSettings()}

                data={this.state.server}
            />
        )
    }

    renderOutputLines() {
        const output = this.state.server.output;

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
        const outputLines = this.renderOutputLines();
        const settingsModal = this.renderSettings();
        const running = this.state.server.status !== "stopped";

        return (
            <article id={this.state.server.name} className="server-dashboard">
                {settingsModal}
                <Card className="server-info">
                    <Card.Header className="server-info-header">{this.state.server.name}</Card.Header>
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
                                key={this.state.server.name}
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
    auth: PropTypes.object.isRequired
}


/**
 * Dashboard displayed on route normal /servers route.
 */
class NoServerDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.user,
            auth:this.props.auth
        };
    }

    createServer(data) {
        const auth = this.state.auth;
        const queryUrl = "/api/servers/";

        apiFetch(auth, data, queryUrl, "put").then((data) => {
            console.log(data)
        });
    }

    render() {
        return (
            <div className="server-dashboard">
                <NewServerForm onSubmit={(data) => this.createServer(data)} />
            </div>
        );
    }
}

NoServerDashboard.propTypes = {
    auth: PropTypes.object.isRequired
}


export function ServersPage(props) {
    const servers = props.servers;
    const user = props.user;
    const logoutAction = props.logoutAction;
    const auth = props.auth;

    return (
        <article className="page">
            <Navigation
                activeKey="/servers"
                servers={servers}
                user={user}
                logoutAction={logoutAction}
            />
            <Switch>
                <Route
                    path="/servers/:serverName"
                    render={(props) => {
                        return (<ServerDashboard {...props} key={props.match.params.serverName} auth={auth}/>)
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
    logoutAction: PropTypes.func,
    auth: PropTypes.object
}

