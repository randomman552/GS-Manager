import React from "react";
import {Button, Form, Modal} from "react-bootstrap";
import PropTypes from "prop-types";
import {BaseForm} from "../../components/BaseForm";

export function NewServerForm(props) {
    return (
        <Modal
            show={props.show}
            onHide={() => {props.setShow(false)}}
            backdrop={true}
        >
            <Modal.Header closeButton>
                <Modal.Title>New server</Modal.Title>
            </Modal.Header>

            <BaseForm onSubmit={props.onSubmit} className="flex flex-column">
                <Modal.Body>
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
                        <Form.Control.Feedback type="invalid">Required</Form.Control.Feedback>
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
                        <Form.Control.Feedback type="invalid">Required</Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="primary" type="submit">
                        Create
                    </Button>
                </Modal.Footer>
            </BaseForm>
        </Modal>
    )
}

NewServerForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    show: PropTypes.bool,
    setShow: PropTypes.func
}
