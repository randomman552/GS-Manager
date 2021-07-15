import React from "react";
import './styles/LoginPage.css';
import PropTypes from "prop-types";
import {LoginForm} from "./components/forms/login-page/LoginForm";

export function LoginPage(props) {
    return (
        <div className="login-page">
            <LoginForm onSubmit={props.onLogin}/>
        </div>
    );
}

LoginPage.propTypes = {
    onLogin: PropTypes.func.isRequired
}