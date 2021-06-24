import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import { LoginPage } from "./pages/LoginPage";
import { getCookie, apiFetch } from "./util";
import './App.css';

export class App extends React.Component{
    constructor(props) {
        super(props);
        const apikey = getCookie("apikey")
        this.state = {
            "apikey": apikey
        };
    }

    login(username, password) {
        const auth = {
            "username": username,
            "password": password
        };

        apiFetch(auth, null, "/api/auth/apikey")
            .then(data => {
            if (!data.error) {
                this.setState({
                    "apikey": data.data.key
                });
                // Set cookie so that until browser restarts, user doesn't have to reload
                document.cookie = "apikey=" + data.data.key;
            }
        });
    }

    render() {
        if (!this.state.apikey) {
            return (
                <div id="app">
                    <Switch>
                        <Route exact path="/login" render={() => {
                            return <LoginPage loginAction={(u, p) => this.login(u, p)}/>
                        }} />
                        <Redirect to="/login" />
                    </Switch>
                </div>
            );
        }

        return (
            <div id="app">
                <Switch>
                    <Route exact path="/servers" />
                    <Redirect to="/servers" />
                </Switch>
            </div>
        );
    }
}

export default App;
