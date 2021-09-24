import {Button, Form, Modal} from "react-bootstrap";
import {BaseForm} from "../../../components/BaseForm";
import React from "react";
import PropTypes from "prop-types";


export function CategoryModalForm(props) {
    const title = (props.data) ? "Edit category" : "New category";
    const submitText = (props.data) ? "Update" : "Create";

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            backdrop={true}
        >
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>

            <BaseForm
                onSubmit={props.onSubmit}
                className="flex flex-column"
            >
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
                            defaultValue={(props.data) ? props.data.name : null}
                        />
                        <Form.Control.Feedback type="invalid">Must be at least 3 characters long</Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="primary" type="submit">
                        {submitText}
                    </Button>
                </Modal.Footer>
            </BaseForm>
        </Modal>
    );
}

CategoryModalForm.propTypes = {
    data: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
}
