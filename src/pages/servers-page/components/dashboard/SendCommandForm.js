import React from "react";
import {Button, Form} from "react-bootstrap";
import PropTypes from "prop-types";
import {BaseForm} from "../../../components/BaseForm";

export function SendCommandForm(props) {
    return (
        <BaseForm onSubmit={props.onSubmit} className="server-console-input">
            <Form.Control
                id="command"
                name="command"
                type="text"
                placeholder="Command here..."
                disabled={props.disabled}
            />
            <Button variant="primary" type="submit" disabled={props.disabled}>
                Send
            </Button>
        </BaseForm>
    )
}

SendCommandForm.propTypes = {
    disabled: PropTypes.bool,
    onSubmit: PropTypes.func.isRequired
}

SendCommandForm.defaultProps = {
    disabled: true
}
