import {BaseForm} from "../../../components/BaseForm";
import PropTypes from "prop-types";
import {Button, Form, Modal} from "react-bootstrap";
import React, {useState} from "react";

export function UserForm(props) {
    const [nameInvalid, setNameInvalid] = useState(false);
    const [nameFeedback, setNameFeedback] = useState("Must be at least 3 characters long");

    const modalTitle = (props.data.id) ? "Edit User" : "New User";
    const submitText = (props.data.id) ? "Update" : "Create";
    const passwordRequired = !props.data.id;

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            backdrop={true}
        >
            <Modal.Header closeButton>
                <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>

            <BaseForm
                onSubmit={props.onSubmit}
                onValidate={props.onValidate}
                onReset={() => {props.onHide()}}
                autofill="new-password"
            >
                <Modal.Body>
                    <Form.Group className="flex flex-column flex-center">
                        <Form.Label htmlFor="name">
                            Username
                        </Form.Label>
                        <Form.Control
                            id="name"
                            name="name"
                            type="text"
                            minLength="3"
                            onChange={event => {
                                // Check the username contains no spaces
                                const containsSpaces = event.target.value.includes(" ");
                                const feedback = (containsSpaces) ? "Cannot contain any spaces" : "Must be at least 3 characters long";
                                setNameInvalid(containsSpaces);
                                setNameFeedback(feedback);
                            }}
                            isInvalid={nameInvalid}
                            required
                            defaultValue={props.data.name}
                        />
                        <Form.Control.Feedback type="invalid">{nameFeedback}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="flex flex-column flex-center">
                        <Form.Label htmlFor="password">
                            Password
                        </Form.Label>
                        <Form.Control
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Password"
                            required={passwordRequired}
                            minLength="8"
                        />
                        <Form.Control.Feedback type="invalid">Must be at least 8 characters long</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group  className="flex flex-column flex-center">
                        <Form.Check
                            type="checkbox"
                            id="isAdmin"
                            name="isAdmin"
                            label="Admin User"
                            defaultChecked={props.data.isAdmin}
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="primary" type="submit">{submitText}</Button>
                    <Button variant="danger" type="reset">Close</Button>
                </Modal.Footer>
            </BaseForm>
        </Modal>
    )
}

UserForm.propTypes = {
    data: PropTypes.object,

    onSubmit: PropTypes.func.isRequired,

    show: PropTypes.bool,
    onHide: PropTypes.func
};

UserForm.defaultProps = {
    data: {},

    show: false,
    onHide: () => {}
}
