import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";
import PropTypes from "prop-types";
import {BaseForm, onChangeFactory} from "../../components/BaseForm";
import {setFetchOptions} from "../../../api/rest/util";
import api from "../../../api/api";
import {addMessage} from "../../components/MessageDisplay";

export function LoginForm(props) {
    const [data, setData] = useState({});

    return (
        <BaseForm
            onSubmit={() => {}}
            onValidate={data => {
                // Suppress normal error message so we can display our own
                setFetchOptions({suppressError: true});
                api.auth.login(data).then(json => {
                    if (json.success) {
                        props.onLogin(json.data);
                    } else {
                        addMessage("Incorrect username or password!", "danger", 5000);
                        setData({password: ""})
                    }
                }).finally(() => {
                    setFetchOptions({suppressError: false});
                })
            }}
            onChange={onChangeFactory(data, setData)}
            id="login-form"
        >
            <h1>Login</h1>
            <Form.Group>
                <Form.Control
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Username"
                    minLength={3}
                    required
                />
                <Form.Control.Feedback type="invalid">Must be at least 3 characters long</Form.Control.Feedback>
                <Form.Control.Feedback type="valid">Username is valid</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <Form.Control
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    minLength={8}
                    value={data.password}
                    required
                />
                <Form.Control.Feedback type="invalid">Must be at least 8 characters long</Form.Control.Feedback>
            </Form.Group>
            <Button variant="primary" type="submit">Login</Button>
        </BaseForm>
    )
}

LoginForm.propTypes = {
    onLogin: PropTypes.func.isRequired
}