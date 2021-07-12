import React from "react";
import './styles/LoginPage.css';
import PropTypes from "prop-types";
import {LoginForm} from "./forms/login-page/LoginForm";

export function LoginPage(props) {
    return (
        <div className="login-page">
            <LoginForm onSubmit={props.loginAction}/>
        </div>
    );
}

LoginPage.propTypes = {
    loginAction: PropTypes.func.isRequired
}