import React from "react";
import {Button, Form, Modal} from "react-bootstrap";
import PropTypes from "prop-types";
import {BaseForm} from "../BaseForm";

function FormInputs(props) {
    // Get old data to use as placeholders
    const name = props.data.name;
    const start_cmd = props.data.start_cmd;
    const update_cmd = props.data.update_cmd;
    const working_directory = props.data.working_directory;

    return (
        <div>
            <Form.Group className="flex flex-column flex-center">
                        <Form.Label className="required-star" htmlFor="name">
                            Name
                        </Form.Label>
                        <Form.Control
                            id="name"
                            name="name"
                            type="text"
                            minLength="3"
                            placeholder={name}
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
                    placeholder={start_cmd}
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
                    placeholder={update_cmd}
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
                    placeholder={working_directory}
                />
            </Form.Group>
        </div>
    )
}


export function UpdateServerForm(props) {
    return (
        <Modal
            show={props.show}
            onHide={props.onClose}
        >
            <BaseForm
                onSubmit={props.onSubmit}
                onReset={props.onClose}
                className="modal-content"
            >
                <Modal.Header>
                    <h2>Server Settings</h2>
                </Modal.Header>
                <Modal.Body>
                    <FormInputs
                        data={props.data}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" type="submit">
                        Update
                    </Button>
                    <Button variant="danger" onClick={props.onClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </BaseForm>
        </Modal>
    )
}

UpdateServerForm.propTypes = {
    data: PropTypes.object,
    show: PropTypes.bool,
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
}

UpdateServerForm.defaultProps = {
    data: {
        name: "",
        start_cmd: "",
        update_cmd: "",
        working_directory: ""
    },
    show: false
}
