import React from "react";
import {Button, Form} from "react-bootstrap";
import PropTypes from "prop-types";
import {BaseForm} from "../BaseForm";

export function NewServerForm(props) {
    return (
        <BaseForm onSubmit={props.onSubmit}>
            <h1>New server</h1>

            <Form.Group className="flex flex-column flex-center">
                    <Form.Label className="required-star" htmlFor="name">
                        Name
                    </Form.Label>
                    <Form.Control
                        id="name"
                        name="name"
                        type="text"
                        required
                        minLength="3"
                    />
                    <Form.Control.Feedback type="invalid">Must be at least 3 characters long</Form.Control.Feedback>
                </Form.Group>

            <Form.Group className="flex flex-column flex-center">
                <Form.Label className="required-star" htmlFor="start_cmd">
                    Start command
                </Form.Label>
                <Form.Control
                    id="start_cmd"
                    name="start_cmd"
                    type="text"
                    required
                />
            </Form.Group>

            <Form.Group className="flex flex-column flex-center">
                <Form.Label className="required-star" htmlFor="update_cmd">
                    Update command
                </Form.Label>
                <Form.Control
                    id="update_cmd"
                    name="update_cmd"
                    type="text"
                    required
                />
            </Form.Group>

            <Form.Group className="flex flex-column flex-center">
                <Form.Label htmlFor="working_directory">
                    Working directory
                </Form.Label>
                <Form.Control
                    id="working_directory"
                    name="working_directory"
                    type="text"
                />
            </Form.Group>

            <Button variant="primary" type="submit">
                Create
            </Button>
        </BaseForm>
    )
}

NewServerForm.propTypes = {
    onSubmit: PropTypes.func.isRequired
}
