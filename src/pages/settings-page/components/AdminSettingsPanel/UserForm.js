import {BaseForm, onChangeFactory} from "../../../components/BaseForm";
import PropTypes from "prop-types";
import {Button, Form, Modal} from "react-bootstrap";
import React, {useState} from "react";

export function UserForm(props) {
    const [data, setData] = useState(props.data);
    // As the instance of user form is reused for multiple users
    // We must handle if the user passed through props has changed
    if (data.id !== props.data.id)
        setData(props.data);

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
                onChange={onChangeFactory(data, setData)}
                onReset={() => {props.onHide(); setData(props.data)}}
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
                            placeholder="Username"
                            required
                            value={data.name}
                        />
                        <Form.Control.Feedback type="invalid">Must be at least 3 characters long</Form.Control.Feedback>
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
                            value={data.password}
                        />
                        <Form.Control.Feedback type="invalid">Must be at least 8 characters long</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group  className="flex flex-column flex-center">
                        <Form.Check
                            type="checkbox"
                            id="is_admin"
                            name="is_admin"
                            label="Admin User"
                            checked={data.is_admin}
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
