import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import { LoginPage } from "./pages/LoginPage";
import { getCookie, apiFetch } from "./util";
import { ServersPage } from "./pages/ServersPage";
import './App.css';

export class App extends React.Component{
    constructor(props) {
        super(props);
        const apikey = getCookie("apikey")
        const username = getCookie("username")
        this.state = {
            "apikey": apikey,
            "username": username
        };
    }

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
                document.cookie = "apikey=" + data.data.key;
                document.cookie = "username=" + username;
            }
        });
    }

    logout() {
        this.setState({
            "apikey": null,
            "username": null
        })
    }

    getUsername() {
        return this.state.username;
    }

    getServers() {
        return ["test", "Gmod: Sandbox"]
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

        return (
            <div id="app">
                <Switch>
                    <Route path="/servers" render={() => {
                            return <ServersPage
                                servers={ this.getServers() }
                                username={ this.getUsername() }
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
