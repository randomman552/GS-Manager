import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import { LoginPage } from "./pages/login-page/LoginPage";
import { ServersPage } from "./pages/servers-page/ServersPage";
import { SettingsPage } from "./pages/settings-page/SettingsPage";
import { apiFetch } from "./util";
import { Modal, Button } from "react-bootstrap";
import './App.css';

export class App extends React.Component {
    constructor(props) {
        super(props);
        // Attempt login from cookie on load
        apiFetch("/api/auth/").then(data => {
            if (!data.error) {
                this.setState({
                    user: data.data
                });
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

        apiFetch("/api/auth/login", null, "post", auth)
            .then(() => {
                apiFetch("/api/auth/")
                    .then(data => {
                    if (!data.error) {
                        this.setState({
                            user: data.data
                        });
                    } else if (data.code === 401) {
                        this.showModal("Login Failed", "Incorrect username or password...");
                    }
                });
        });
    }

    /**
     * Forget the currently remembered apikey.
     */
    logout() {
        apiFetch("/api/auth/logout").then(() => {
            this.setState({
                "user": null
            });
        });
    }


    /**
     * Query api for servers and users.
     */
    queryApi() {
        const auth = this.getAuth();
        if (auth) {
            apiFetch("/api/servers/").then(data => {
                if (!data.error) {
                    this.setState({
                        servers: data.data
                    });
                }
                return null;
            });
        }
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
                <Switch>
                    <Route
                        path="/servers"
                        render={(props) => {
                            return <ServersPage
                                {...props}
                                auth={auth}
                                servers={servers}
                                user={user}
                                onLogout={() => this.logout()}
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
                                onLogout={() => this.logout()}
                            />
                        }}
                    />
                    <Redirect to="/servers" />
                </Switch>
            </div>
        );
    }


    componentDidMount() {
        this.queryApi();
        this.interval = setInterval(() => this.queryApi(), 500);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }
}

export default App;
