import React, { useRef } from "react";
import { Navigation } from "./components";
import { apiFetch } from "../util";
import { Card, Button, Form } from "react-bootstrap";
import "./styles/ServersPage.css"
import ScrollToBottom from "react-scroll-to-bottom";

class ServerDashboardCommandLine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "command": ""
        };
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.props.submitAction) {
            this.props.submitAction(this.state.command);
            this.setState({
                "command": ""
            });
        }
    }

    render() {
        const command = this.state.command;
        return (
            <Form className="server-console-input" onSubmit={(event) => this.handleSubmit(event)}>
                <Form.Control
                    id="command"
                    name="command"
                    type="text"
                    value={command}
                    placeholder="Command here..."
                    disabled={this.props.disabled}
                    onChange={(event) => this.handleChange(event)}
                />
                <Button variant="primary" type="submit" disabled={this.props.disabled}>
                    Send
                </Button>
            </Form>
        )
    }
}

class ServerDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "name": this.props.name,
            "user": this.props.user,
            "apikey": this.props.apikey,
            "server": {
                "name": this.props.name,
                "output": []
            }
        };
    }

    getServer() {
        const name = this.state.name;
        if (name) {
            const queryUrl = "/api/servers/" + this.state.name;
            const auth = {
                "apikey": this.state.apikey
            }

            apiFetch(auth, null, queryUrl).then((data) => {
                this.setState({
                    "server": data.data
                })
            });
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => this.getServer(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    startServer() {
        const name = this.state.name;
        if (name) {
            const queryUrl = "/api/servers/" + this.state.name + "/start";
            const auth = {
                "apikey": this.state.apikey
            }

            apiFetch(auth, null, queryUrl).then(r => {});
        }
    }

    updateServer() {
        const name = this.state.name;
        if (name) {
            const queryUrl = "/api/servers/" + this.state.name + "/update";
            const auth = {
                "apikey": this.state.apikey
            }

            apiFetch(auth, null, queryUrl).then(r => {});
        }
    }

    stopServer() {
        const name = this.state.name;
        if (name) {
            const queryUrl = "/api/servers/" + this.state.name + "/stop";
            const auth = {
                "apikey": this.state.apikey
            }

            apiFetch(auth, null, queryUrl).then(r => {});
        }
    }

    sendCommand(command) {
        const name = this.state.name;
        if (name) {
            const queryUrl = "/api/servers/" + this.state.name + "/command";
            const auth = {
                "apikey": this.state.apikey
            };
            const data = {
                "command": command
            };

            apiFetch(auth, data, queryUrl).then(r => {});
        }
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
        const running = this.state.server.status !== "stopped";

        return (
            <article id={this.state.server.name} className="server-dashboard">
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

                            <ServerDashboardCommandLine
                                key={this.state.server.name}
                                submitAction={(command) => this.sendCommand(command)}
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
                        </article>
                    </Card.Body>
                </Card>
            </article>
        );
    }
}

export function ServersPage(props) {
    const servers = props.servers;
    const user = props.user;
    const logoutAction = props.logoutAction;
    const apikey = props.apikey;
    const serverName = props.match.params.serverName;

    return (
        <article className="page">
            <Navigation
                activeKey="/servers"
                servers={servers}
                user={user}
                logoutAction={logoutAction}
            />
            <ServerDashboard key={serverName} name={serverName} apikey={apikey} user={user} />
        </article>
    )
}
