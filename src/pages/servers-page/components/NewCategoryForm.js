import {Button, Form, Modal} from "react-bootstrap";
import {BaseForm} from "../../components/BaseForm";
import React from "react";
import PropTypes from "prop-types";
import {NewServerForm} from "./NewServerForm";


export function NewCategoryForm(props) {
    return (
        <Modal
            show={props.show}
            onHide={() => {props.setShow(false)}}
            backdrop={true}
        >
            <Modal.Header closeButton>
                <Modal.Title>New category</Modal.Title>
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
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="primary" type="submit">
                        Create
                    </Button>
                </Modal.Footer>
            </BaseForm>
        </Modal>
    );
}

NewServerForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    show: PropTypes.bool,
    setShow: PropTypes.func
}
