import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import { LoginPage } from "./pages/LoginPage";
import './App.css';


async function apiPost(apiKey, data, url) {
    data = {
        "apikey": apiKey,
        "data": data
    }

    let response = await fetch (
        url,
        {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            method: "post",
            body: JSON.stringify(data)
        }
    );
    return await response.json()
}


export class App extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            "apikey": null
        };
    }

    login(username, password) {
        const data = {
            "username": username,
            "password": password
        }

        apiPost(null, data, "/api/auth/apikey")
            .then(data => {
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
