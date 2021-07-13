import React from "react";
import {Button, Form, Modal, Tab, Tabs} from "react-bootstrap";
import PropTypes from "prop-types";
import {BaseForm} from "../BaseForm";

function GeneralSettingsForm(props) {
    const name = props.data.name;
    const start_cmd = props.data.start_cmd;
    const update_cmd = props.data.update_cmd;
    const working_directory = props.data.working_directory;

    return (
        <BaseForm
            onSubmit={props.onSubmit}
            className="modal-body text-center"
        >
            <Form.Group className="flex flex-column flex-center">
                    <Form.Label htmlFor="name">
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
                <Form.Label htmlFor="start_cmd">
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
                <Form.Label htmlFor="update_cmd">
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
            <Button variant="primary" type="submit">
                Update
            </Button>
        </BaseForm>
    )
}

GeneralSettingsForm.propTypes = {
    data: PropTypes.object,
    onSubmit: PropTypes.func.isRequired
}


function ModeSettingsForm(props) {
    return (
        <>
            <BaseForm
                onSubmit={props.onAdd}
                className="modal-body mode-display"
            >
                <Form.Control
                    id="name"
                    name="name"
                    placeholder="Name"
                    required
                />
                <Form.Control
                    id="arguments"
                    name="arguments"
                    placeholder="Arguments"
                    required
                />
                <Button type="submit" variant="primary">
                    Add
                </Button>
            </BaseForm>
        </>
    )
}

ModeSettingsForm.propTypes = {
    data: PropTypes.object,
    onAdd: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
}


export function UpdateServerForm(props) {
    return (
        <Modal
            show={props.show}
            onHide={props.onClose}
            size="lg"
        >
            <Modal.Header>
                <h2>Server Settings</h2>
            </Modal.Header>
            <Tabs defaultActiveKey="general">
                <Tab eventKey="general" title="General">
                    <GeneralSettingsForm
                        data={props.data}
                        onSubmit={props.onGeneralSubmit}
                    />
                </Tab>
                <Tab eventKey="modes" title="Modes">
                    <ModeSettingsForm
                        data={props.data}
                        onAdd={props.onModeAdd}
                        onEdit={props.onModeEdit}
                        onDelete={props.onModeDelete}
                    />
                </Tab>
            </Tabs>
            <Modal.Footer>
                <Button variant="danger" onClick={props.onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

UpdateServerForm.propTypes = {
    data: PropTypes.object,
    show: PropTypes.bool,
    onClose: PropTypes.func.isRequired,

    onGeneralSubmit: PropTypes.func.isRequired,
    onModeAdd: PropTypes.func.isRequired,
    onModeEdit: PropTypes.func.isRequired,
    onModeDelete: PropTypes.func.isRequired
}

UpdateServerForm.defaultProps = {
    data: {
        name: "",
        start_cmd: "",
        update_cmd: "",
        working_directory: "",

        mode: "",
        mode_map: {}
    },
    show: false
}
