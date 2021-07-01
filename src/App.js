import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import { LoginPage } from "./pages/LoginPage";
import { getCookie, setCookie, deleteCookie, apiFetch } from "./util";
import { ServersPage } from "./pages/ServersPage";
import { Modal, Button } from "react-bootstrap";
import './App.css';

export class App extends React.Component{
    constructor(props) {
        super(props);

        const apikey = getCookie("apikey")
        this.state = {
            "apikey": apikey,
            "user": null,
            "servers": [],
            "modal": {
                "title": null,
                "message": null
            }
        };

        if (apikey) {
            this.getUser();
            this.getServers();
        }
    }

    /**
     * Send an authentication request to the server to get the api key used to make future requests.
     * @param username {string} The username to authenticate with.
     * @param password {string} The password to authenticate with.
     */
    login(username, password) {
        let auth = {
            "username": username,
            "password": password
        };

        apiFetch(auth, null, "/api/auth/apikey")
            .then(data => {
            if (!data.error) {
                this.setState({
                    "apikey": data.data,
                    "username": username
                });

                // Set cookie so that until browser restarts, user doesn't have to re-log
                setCookie("apikey", data.data);

                this.getUser();
                this.getServers();
            } else if (data.code === 401) {
                this.showModal("Login Failed", "Incorrect username or password...");
            }
        });

    }

    /**
     * Forget the currently remembered apikey.
     */
    logout() {
        deleteCookie("apikey");
        this.setState({
            "apikey": null,
            "user": null,
            "servers": []
        });
    }

    /**
     * Query the api for the User object, when received it will be stored in this.state.user
     */
    getUser() {
        const auth = {
            "apikey": this.state.apikey
        };

        apiFetch(auth, null, "/api/auth/").then(data => {
            if (!data.error) {
                this.setState({
                    "user": data.data
                });
            }
            return null;
        });
    }

    /**
     * Query the api for the names of all servers.
     * Stores them in this.state.servers.
     */
    getServers() {
        const auth = {
            "apikey": this.state.apikey
        };

        apiFetch(auth, null, "/api/servers/").then(data => {
            if (!data.error) {
                this.setState({
                    "servers": data.data
                });
            }
            return null;
        });
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
        if (!this.state.apikey) {
            return (
                <div id="app">
                    {modal}
                    <Switch>
                        <Route exact path="/login" render={ () => {
                            return <LoginPage loginAction={ (u, p) => this.login(u, p) }/>
                        }} />
                        <Redirect to="/login" />
                    </Switch>
                </div>
            );
        }

        const user = this.state.user;
        const servers = this.state.servers;

        return (
            <div id="app">
                <Switch>
                    <Route
                        exact path="/servers"
                        render={(props) => {
                                return <ServersPage
                                    {...props}
                                    servers={ servers }
                                    user={user}
                                    logoutAction={ () => this.logout() }
                                />
                            }} />
                    <Route
                        path="/servers/:serverName"
                        render={(props) => {
                            return <ServersPage
                                {...props}
                                servers={ servers }
                                user={user}
                                logoutAction={ () => this.logout() }
                            />
                        }}
                    />
                    <Redirect to="/servers" />
                </Switch>
            </div>
        );
    }
}

export default App;
