import React from "react";
import './styles/LoginPage.css';
import {Button} from "react-bootstrap";

class LoginForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            "loginAction": props.loginAction,
            "username": "",
            "password": ""
        };
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        event.preventDefault();

        const username = this.state.username;
        const password = this.state.password;
        this.state.loginAction(username, password);
    }

    render() {
        return (
            <form id="login-form" className="container-sm" onSubmit={(event) => { this.handleSubmit(event) }}>
                <h1>Login</h1>
                <div className="form-group">
                    <input
                        className="form-control"
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Username"
                        value={this.state.username}
                        onChange={(event) => { this.handleChange(event) }}
                    />
                </div>
                <div className="form-group">
                    <input
                        className="form-control"
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={this.state.password}
                        onChange={(event) => { this.handleChange(event) }}
                    />
                </div>
                <Button variant="primary" type="submit">Login</Button>
            </form>
        );
    }
}

export function LoginPage(props) {
    return (
        <div className="login-page">
            <LoginForm loginAction={props.loginAction}/>
        </div>
    );
}