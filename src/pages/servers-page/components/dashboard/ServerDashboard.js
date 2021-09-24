import React from "react";
import api from "../../../../api/api";
import {addMessage} from "../../../components/MessageDisplay";
import {Redirect} from "react-router-dom";
import {deepCopy} from "../../../../util";
import {UpdateServerForm} from "./UpdateServerForm";
import {Button, Card} from "react-bootstrap";
import ScrollToBottom from "react-scroll-to-bottom";
import {SendCommandForm} from "./SendCommandForm";
import PropTypes from "prop-types";


/**
 * Dashboard displayed when on a route for a given server.
 */
export class ServerDashboard extends React.Component {
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
            api.servers.start(this.server.id).then(() => {
                addMessage("Server started", "success", 5000);
            });
    }

    updateServer() {
        if (this.server)
            api.servers.update(this.server.id).then(() => {
                addMessage("Server updating", "warning", 5000);
            });
    }

    stopServer() {
        if (this.server)
            api.servers.stop(this.server.id).then(() => {
                addMessage("Server stopped", "danger", 5000);
            });
    }


    sendCommand(data) {
        if (this.server && data.command) {
            const toSend = {
                "command": data.command
            };
            api.servers.sendCommand(this.server.id, toSend).then();
        }
    }

    /**
     * Method to edit the current server with the given data.
     * @param data
     */
    modifySettings(data) {
        if (this.server) {
            api.servers.modify(this.server.id, data).then(data => {
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
            api.servers.delete(this.server.id).then(data => {
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

            api.servers.modify(server.id, {mode_map}).then();
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

            api.servers.modify(server.id, {mode_map}).then();
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

            api.servers.modify(server.id, {mode_map}).then();
        }
    }


    renderSettings() {
        const show = this.state.showSettingsModal;

        return (
            <UpdateServerForm
                categories={this.props.categories}
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
    server: PropTypes.object.isRequired,
    categories: PropTypes.arrayOf(PropTypes.object).isRequired
}
