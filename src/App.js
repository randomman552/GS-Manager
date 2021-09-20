import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import { LoginPage } from "./pages/login-page/LoginPage";
import { ServersPage } from "./pages/servers-page/ServersPage";
import { SettingsPage } from "./pages/settings-page/SettingsPage";
import { Modal, Button } from "react-bootstrap";
import './App.css';
import api from "./api/api";
import MessageDisplay from "./pages/components/MessageDisplay";
import {Navigation} from "./pages/components/Navigation";

export class App extends React.Component {
    constructor(props) {
        super(props);
        // Attempt login from cookie on load
        api.auth.getCurrentUser().then(data => {
            if (!data.error) {
                this.setState({
                    user: data.data
                });
                api.servers.getServers().then((data) => {
                   this.setState({
                       servers: api.servers.servers.asArray
                   });
                });
                api.auth.getUsers().then();
            } else if (data.code === 401) {
                this.logout();
            }
        });

        this.state = {
            user: null,
            servers: [],
            modal: {
                "title": null,
                "message": null
            }
        };
    }


    /**
     * Send an authentication request to the server to get the api key used to make future requests.
     * @param data Data provided by BaseForm class.
     */
    login(data) {
        let auth = {
            "username": data.username,
            "password": data.password
        };

        api.auth.login(auth)
            .then(() => {
                api.auth.getCurrentUser()
                    .then(data => {
                    if (!data.error) {
                        this.setState({
                            user: data.data
                        });
                        api.servers.getServers().then((data) => {
                           this.setState({
                               servers: api.servers.servers.asArray
                           });
                        });
                        api.auth.getUsers().then();
                    } else if (data.code === 401) {
                        this.showModal("Login Failed", "Incorrect username or password...");
                    }
                });
            });
    }

    /**
     * Destroy current session.
     */
    logout() {
        api.auth.logout().then(() => {
            this.setState({
                "user": null
            });
        });
    }

    /**
     * Method to construct authentication object from current app state.
     */
    getAuth() {
        if (this.state.user)
            return {
                apikey: this.state.user.api_key
            };
        return null;
    }


    /**
     * Method to show the global modal in the application.
     * @param title The title to display
     * @param message The message to display
     */
    showModal(title, message) {
        this.setState({
            "modal": {
                "show": true,
                "title": title,
                "message": message
            }
        });
    }

    hideModal() {
        this.setState({
            "modal": {
                "show": false,
                "title": this.state.modal.title,
                "message": this.state.modal.message
            }
        });
    }

    renderModal() {
        const show = this.state.modal.show;
        const title = this.state.modal.title;
        const message = this.state.modal.message;

        const onHide = () => { this.hideModal() };

        return (
            <Modal
                show={show}
                onHide={onHide}
                keyboard={true}
            >
              <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <p>
                    {message}
                </p>
              </Modal.Body>

              <Modal.Footer>
                <Button variant="primary" onClick={onHide}>Close</Button>
              </Modal.Footer>
            </Modal>
        )
}


    render() {
        const modal = this.renderModal();
        if (!this.state.user) {
            return (
                <div id="app">
                    <MessageDisplay/>
                    {modal}
                    <Switch>
                        <Route exact path="/login" render={ () => {
                            return <LoginPage onLogin={ (u, p) => this.login(u, p) }/>
                        }} />
                        <Redirect to="/login" />
                    </Switch>
                </div>
            );
        }

        const user = this.state.user;
        const servers = this.state.servers;
        const auth = this.getAuth();

        return (
            <div id="app">
                <Navigation
                    user={user}
                    onLogout={() => {this.logout()}}
                />
                <MessageDisplay/>
                <Switch>
                    <Route
                        path="/servers"
                        render={(props) => {
                            return <ServersPage
                                {...props}
                                auth={auth}
                                servers={servers}
                            />
                        }}
                    />
                    <Route
                        path="/settings"
                        render={(props) => {
                            return <SettingsPage
                                {...props}
                                auth={auth}
                                user={user}
                            />
                        }}
                    />
                    <Redirect to="/servers" />
                </Switch>
            </div>
        );
    }


    componentDidMount() {
        const serverUpdateFunc = (servers) => {
            this.setState({
                servers
            });
        }
        const userUpdateFunc = () => {
            if (!this.state.user)
                return;

            // Update user object
            const user = api.auth.users.getObject(this.state.user.id);
            this.setState({
                user
            });

            if (user) {
                // Re-log after api-key change
                api.auth.login(this.getAuth()).then(data => {
                    if (data.code !== 200)
                        this.logout();
                });
            } else {
                // Log out if user deleted
                this.logout();
            }
        }

        api.servers.servers.addChangeListener(serverUpdateFunc);
        api.auth.users.addChangeListener(userUpdateFunc);

        // Remove change listeners on component unmount
        this.componentWillUnmount = () => {
            api.servers.servers.removeChangeListener(serverUpdateFunc);
            api.auth.users.removeChangeListener(userUpdateFunc);
        }
    }
}

export default App;
