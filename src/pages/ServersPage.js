import React from "react";
import { Navigation } from "./components";
import { apiFetch } from "../util";
import { Card, Button, Form, Modal } from "react-bootstrap";
import "./styles/ServersPage.css"
import ScrollToBottom from "react-scroll-to-bottom";
import PropTypes from 'prop-types';
import { Switch, Route } from "react-router-dom";

// region Command sending form

class SendCommandForm extends React.Component {
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

SendCommandForm.propTypes = {
    disabled: PropTypes.bool,
    submitAction: PropTypes.func.isRequired
}

SendCommandForm.defaultProps = {
    disabled: true
}

//endregion

// region Server update form

class UpdateServerForm extends React.Component {
    defaultState = {
        name: "",
        start_cmd: "",
        update_cmd: "",
        working_directory: "",

        validated: false
    }

    constructor(props) {
        super(props);

        this.state = {}
        const newState = {}
        Object.assign(newState, this.defaultState)
        this.setState(newState)
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
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();
        this.setState({
            validated: true
        });

        // Return if form does not validate correctly
        if (!form.checkValidity())
            return

        if (this.props.submitAction) {
            const data = {};
            const forbiddenKeys = ["validated"]

            // Ignore keys we dont need
            for (const key in this.state) {
                if (this.state.hasOwnProperty(key) && !forbiddenKeys.includes(key)) {
                    if (this.state[key]) {
                        // Move data into new data object for submission
                        data[key] = this.state[key];
                    }
                }
            }
            this.props.submitAction(data);
            this.resetForm();
        }
    }

    renderFormInputs() {
        // Get old data to use as placeholders
        const name = this.props.data.name;
        const start_cmd = this.props.data.start_cmd;
        const update_cmd = this.props.data.update_cmd;
        const working_directory = this.props.data.working_directory;

        // Set required flag if each bit of data has been edited
        const required = this.props.mode === "new";
        const nameRequired = this.state.name || required;

        return (
            <div>
                <Form.Group className="flex flex-column flex-center">
                        <Form.Label className="required-star" htmlFor="name">
                            Name
                        </Form.Label>
                        <Form.Control
                            id="name"
                            name="name"
                            type="text"
                            required={nameRequired}
                            minLength="3"
                            placeholder={name}
                            onChange={(event) => this.handleChange(event)}
                        />
                        <Form.Control.Feedback type="invalid">Must be at least 3 characters long</Form.Control.Feedback>
                    </Form.Group>

                <Form.Group className="flex flex-column flex-center">
                    <Form.Label className="required-star" htmlFor="start_cmd">
                        Start command
                    </Form.Label>
                    <Form.Control
                        id="start_cmd"
                        name="start_cmd"
                        type="text"
                        required={required}
                        placeholder={start_cmd}
                        onChange={(event) => this.handleChange(event)}
                    />
                </Form.Group>

                <Form.Group className="flex flex-column flex-center">
                    <Form.Label className="required-star" htmlFor="update_cmd">
                        Update command
                    </Form.Label>
                    <Form.Control
                        id="update_cmd"
                        name="update_cmd"
                        type="text"
                        required={required}
                        placeholder={update_cmd}
                        onChange={(event) => this.handleChange(event)}
                    />
                </Form.Group>

                <Form.Group className="flex flex-column flex-center">
                    <Form.Label htmlFor="working_directory">
                        Working directory
                    </Form.Label>
                    <Form.Control
                        id="working_directory"
                        name="working_directory"
                        type="text"
                        placeholder={working_directory}
                        onChange={(event) => this.handleChange(event)}
                    />
                </Form.Group>
            </div>
        )
    }

    resetForm() {
        const newState = {}
        Object.assign(newState, this.defaultState)
        this.setState(newState)
    }

    render() {
        const title = (this.props.mode === "new") ? "New server" : "Edit settings";
        const submitText = (this.props.mode === "new") ? "Create" : "Update";


        if (this.props.variant === "modal") {
            return (
                    <Modal
                    show={this.props.show}
                    backdrop="static"
                    keyboard={false}
                    >
                        <Modal.Header>
                            <h2>{title}</h2>
                        </Modal.Header>
                        <Form
                            noValidate
                            validated={this.state.validated}
                            onSubmit={(event) => this.handleSubmit(event)}
                        >
                            <Modal.Body>
                                {this.renderFormInputs()}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="primary" type="submit">
                                    {submitText}
                                </Button>

                                <Button variant="danger" onClick={this.props.closeAction}>
                                    Close
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
            )
        }
        else {
            return (
                <Form
                    noValidate
                    validated={this.state.validated}
                    className="flex flex-column flex-center"
                    onSubmit={(event) => this.handleSubmit(event)}
                >
                    <h1>{title}</h1>
                    {this.renderFormInputs()}
                    <Button variant="primary" type="submit">
                        {submitText}
                    </Button>
                </Form>
            )
        }
    }
}

UpdateServerForm.propTypes = {
    // TODO: Custom data validator?
    data: PropTypes.object,
    mode: PropTypes.oneOf(['new', 'update']),
    variant: PropTypes.oneOf(['modal', 'stand-alone']),
    show: PropTypes.bool,
    submitAction: PropTypes.func.isRequired,
    closeAction: PropTypes.func
}

UpdateServerForm.defaultProps = {
    data: {
        name: "",
        start_cmd: "",
        update_cmd: "",
        working_directory: ""
    },
    variant: 'stand-alone',
    mode: 'new',
    show: false
}

// endregion

// region Primary dashboard components

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

    sendCommand(command) {
        const name = this.state.name;
        if (name) {
            const queryUrl = "/api/servers/" + this.state.name + "/command";
            const auth = this.props.auth;
            const data = {
                "command": command
            };

            apiFetch(auth, data, queryUrl).then(r => {});
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
                variant="modal"
                mode="update"
                show={show}
                submitAction={(data) => this.modifySettings(data)}
                closeAction={() => this.closeSettings()}

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
                <UpdateServerForm variant="stand-alone" mode="new" submitAction={(data) => this.createServer(data)} />
            </div>
        );
    }
}

NoServerDashboard.propTypes = {
    auth: PropTypes.object.isRequired
}

// endregion

// region Server page export

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

// endregion
