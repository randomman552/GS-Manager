import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import { LoginPage } from "./pages/login-page/LoginPage";
import { ServersPage } from "./pages/servers-page/ServersPage";
import { SettingsPage } from "./pages/settings-page/SettingsPage";
import './App.css';
import api from "./api/api";
import MessageDisplay from "./pages/components/MessageDisplay";
import {Navigation} from "./pages/components/Navigation";
import {SystemPage} from "./pages/system-page/SystemPage";

export class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null
        };

        // Attempt login using old session
        api.auth.getCurrentUser().then(json => {
            if (json.success) {
                this.setState({
                    user: json.data
                });
            } else if (json.code === 401) {
                this.logout();
            }
        });
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
            .then(json => {
                if (json.success) {
                    this.setState({
                        user: json.data
                    });
                }
            });
    }

    /**
     * Destroy current session.
     */
    logout() {
        api.auth.logout().then(json => {
            if (json.success) {
                this.setState({
                    "user": null
                });
            }
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


    render() {
        if (!this.state.user) {
            return (
                <div id="app">
                    <MessageDisplay/>
                    <LoginPage
                        onLogin={ (u, p) => this.login(u, p) }
                    />
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
                    <Route
                        path="/system"
                        component={SystemPage}
                    />
                    <Redirect to="/servers" />
                </Switch>
            </div>
        );
    }


    componentDidMount() {
        this.onUserChange = () => {
            if (!this.state.user)
                return;

            // Update user object
            const user = api.auth.data.get(this.state.user.id);
            this.setState({
                user
            });

            if (user) {
                // Re-log after api-key change
                api.auth.login(this.getAuth()).then(json => {
                    if (!json.success)
                        this.logout();
                });
            } else {
                // Log out if user deleted
                this.logout();
            }
        }

        api.auth.addChangeListener(this.onUserChange);
    }

    componentWillUnmount() {
        api.auth.removeChangeListener(this.onUserChange);
    }
}

export default App;
