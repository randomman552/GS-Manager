import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import { LoginPage } from "./pages/LoginPage";
import { getCookie, setCookie, deleteCookie, apiFetch } from "./util";
import { ServersPage } from "./pages/ServersPage";
import './App.css';

export class App extends React.Component{
    constructor(props) {
        super(props);

        const apikey = getCookie("apikey")
        this.state = {
            "apikey": apikey,
            "user": null,
            "servers": []
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
                    "apikey": data.data.key,
                    "username": username
                });

                // Set cookie so that until browser restarts, user doesn't have to re-log
                setCookie("apikey", data.data.key);

                this.getUser();
                this.getServers();
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
                    "user": data.data.user
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
                    "servers": data.data.servers
                });
            }
            return null;
        });
    }

    render() {
        if (!this.state.apikey) {
            return (
                <div id="app">
                    <Switch>
                        <Route exact path="/login" render={ () => {
                            return <LoginPage loginAction={ (u, p) => this.login(u, p) }/>
                        }} />
                        <Redirect to="/login" />
                    </Switch>
                </div>
            );
        }

        const username = (this.state.user)? this.state.user.name : "username";
        const servers = this.state.servers;

        return (
            <div id="app">
                <Switch>
                    <Route path="/servers" render={() => {
                            return <ServersPage
                                servers={ servers }
                                username={ username }
                                logoutAction={ () => this.logout() }
                            />
                        }} />
                    <Redirect to="/servers" />
                </Switch>
            </div>
        );
    }
}

export default App;
