import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import { LoginPage } from "./pages/LoginPage";
import { apiFetch } from "./util";
import { ServersPage } from "./pages/ServersPage";
import { Modal, Button } from "react-bootstrap";
import './App.css';
import {UserManagementPage} from "./pages/UserManagementPage";

export class App extends React.Component {
    constructor(props) {
        super(props);
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

        apiFetch(auth, null, "/api/auth/")
            .then(data => {
            if (!data.error) {
                this.setState({
                    user: data.data
                })
            } else if (data.code === 401) {
                this.showModal("Login Failed", "Incorrect username or password...");
            }
        });
    }

    /**
     * Forget the currently remembered apikey.
     */
    logout() {
        this.setState({
            "user": null
        });
    }


    /**
     * Query api for servers and users.
     */
    queryApi() {
        const auth = this.getAuth();
        if (auth) {
            apiFetch(auth, null, "/api/servers/").then(data => {
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
                        path="/user-management"
                        render={(props) => {
                            return <UserManagementPage
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
