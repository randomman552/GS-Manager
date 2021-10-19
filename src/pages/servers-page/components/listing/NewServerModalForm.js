import React from "react";
import {Button, Form, Modal} from "react-bootstrap";
import PropTypes from "prop-types";
import {BaseForm} from "../../../components/BaseForm";

export function NewServerModalForm(props) {
    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
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
                        <Form.Label className="required-star" htmlFor="startCmd">
                            Start command
                        </Form.Label>
                        <Form.Control
                            id="startCmd"
                            name="startCmd"
                            type="text"
                            required
                        />
                        <Form.Control.Feedback type="invalid">Required</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="flex flex-column flex-center">
                        <Form.Label htmlFor="updateCmd">
                            Update command
                        </Form.Label>
                        <Form.Control
                            id="updateCmd"
                            name="updateCmd"
                            type="text"
                        />
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

NewServerModalForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
}
