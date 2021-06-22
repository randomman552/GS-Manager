import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import { LoginPage } from "./pages/LoginPage";
import './App.css';

export class App extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            "apikey": null
        };
    }

    login(username, password) {
        const data = new FormData();
        data.set("username", username);
        data.set("password", password);

        fetch(
            "/api/auth/api-key",
            {
                method: "post",
                body: data
            }
        ).then(res => res.json()).then(data => {
            if (!data.error) {
                this.setState({
                    "apikey": data.data.key
                });
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

                </Switch>
            </div>
        );
    }
}

export default App;
