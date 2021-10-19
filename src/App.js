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
import {NotFoundPage} from "./pages/components/NotFoundPage";
import {setFetchOptions} from "./api/rest/util";

export class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null
        };

        // Suppress errors so that the user will not see an error message if they aren't logged in.
        setFetchOptions({suppressError: true});
        // Attempt login using old session
        api.auth.getCurrentUser().then(json => {
            if (json.success) {
                this.setState({
                    user: json.data
                });
            } else if (json.code === 401) {
                this.logout();
            }
        }).finally(() => {
            setFetchOptions({suppressError: false});
        });
    }


    /**
     * Send an authentication request to the server to get the api key used to make future requests.
     * @param user The user object retrieved by login.
     */
    login(user) {
        this.setState({
            user
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

        return (
            <div id="app">
                <Navigation
                    user={user}
                    onLogout={() => {this.logout()}}
                />
                <MessageDisplay/>
                <Switch>
                    {/* Root path redirect to servers */}
                    <Route
                        exact path="/"
                        render={(props) => {
                            return (
                                <Redirect
                                    to="/servers"
                                />
                            )
                        }}
                    />

                    {/* Other endpoints */}
                    <Route
                        path="/servers"
                        render={(props) => {
                            return <ServersPage
                                {...props}
                                servers={servers}
                            />
                        }}
                    />
                    <Route
                        path="/settings"
                        render={(props) => {
                            return <SettingsPage
                                {...props}
                                user={user}
                            />
                        }}
                    />
                    <Route
                        path="/system"
                        component={SystemPage}
                    />

                    {/* Display 404 page if none of the previous routes are used */}
                    <Route
                        component={NotFoundPage}
                    />
                </Switch>
            </div>
        );
    }


    componentDidMount() {
        this.onUserChange = () => {
            if (!this.state.user)
                return;

            // Update user object if not deleted
            const user = api.auth.data.get(this.state.user.id);
            if (user) {
                // If apikey has changed, re-log with new one
                if (user.apiKey && this.state.user.apiKey !== user.apiKey)
                    api.auth.login({apikey: user.apiKey});

                // Update stored user
                this.setState({
                    user
                });
            } else {
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
