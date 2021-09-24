import {BaseForm} from "../../../components/BaseForm";
import PropTypes from "prop-types";
import {Button, Form, Modal} from "react-bootstrap";
import React from "react";

export function ChangePasswordModal(props) {
    const modalTitle = "Edit password";
    const submitText = "Update";

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
                onReset={() => {props.onHide()}}
            >
                <Modal.Body>
                    <Form.Group className="flex flex-column flex-center">
                        <Form.Label htmlFor="password">
                            Password
                        </Form.Label>
                        <Form.Control
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Password"
                            required={true}
                            minLength="8"
                        />
                        <Form.Control.Feedback type="invalid">Must be at least 8 characters long</Form.Control.Feedback>
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

ChangePasswordModal.propTypes = {
    data: PropTypes.object,

    onSubmit: PropTypes.func.isRequired,

    show: PropTypes.bool,
    onHide: PropTypes.func
};

ChangePasswordModal.defaultProps = {
    data: {},

    show: false,
    onHide: () => {}
}
