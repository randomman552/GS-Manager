import {BaseForm} from "../../../components/BaseForm";
import PropTypes from "prop-types";
import {Button, Form, Modal} from "react-bootstrap";
import React from "react";

export function ChangeUsernameModal(props) {
    const modalTitle = "Edit username";
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
                onReset={() => {props.onHide();}}
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
                            defaultValue={props.data.name}
                        />
                        <Form.Control.Feedback type="invalid">Must be at least 3 characters long</Form.Control.Feedback>
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

ChangeUsernameModal.propTypes = {
    data: PropTypes.object,

    onSubmit: PropTypes.func.isRequired,

    show: PropTypes.bool,
    onHide: PropTypes.func
};

ChangeUsernameModal.defaultProps = {
    data: {},

    show: false,
    onHide: () => {}
}
