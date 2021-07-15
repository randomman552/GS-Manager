import React from "react";
import {Button, Form} from "react-bootstrap";
import PropTypes from "prop-types";
import {BaseForm} from "../BaseForm";

export function LoginForm(props) {
    return (
        <BaseForm
            onSubmit={props.onSubmit}
            id="login-form"
        >
            <h1>Login</h1>
            <Form.Group>
                <Form.Control
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Username"
                    required
                />
            </Form.Group>
            <Form.Group>
                <Form.Control
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                />
            </Form.Group>
            <Button variant="primary" type="submit">Login</Button>
        </BaseForm>
    )
}

LoginForm.propTypes = {
    onSubmit: PropTypes.func.isRequired
}