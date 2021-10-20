import React, {useState} from "react";
import {Accordion, Button, Card, Form, Modal, Tab, Tabs} from "react-bootstrap";
import PropTypes from "prop-types";
import {BaseForm} from "../../../components/BaseForm";
import {InfoTooltip} from "../../../components/InfoTooltip";


function GeneralSettingsForm(props) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    const onDelete = (confirmDelete) ? props.onDelete : () => {setConfirmDelete(true)};
    const deleteText = (confirmDelete) ? "Confirm delete? (this is irreversible)" : "Delete";

    const categoryOptions = props.categories.map((category) => {
        return (<option value={category.id}>{category.name}</option>)
    })

    return (
        <BaseForm
            onSubmit={props.onSubmit}
            className="modal-body text-center"
            autofill="off"
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
                    required={true}
                    defaultValue={props.data.name}
                />
                <Form.Control.Feedback type="invalid">Must be at least 3 characters long</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <Form.Label htmlFor="category">
                    Category
                </Form.Label>
                <Form.Control
                    id="category"
                    name="category"
                    as="select"
                    defaultValue={props.data.category}
                >
                    <option value="">None</option>
                    {categoryOptions}
                </Form.Control>
            </Form.Group>
            <Form.Group className="flex flex-column flex-center">
                <Form.Label htmlFor="startCmd">
                    Start command
                </Form.Label>
                <Form.Control
                    id="startCmd"
                    name="startCmd"
                    type="text"
                    required={true}
                    defaultValue={props.data.startCmd}
                />
                <Form.Control.Feedback type="invalid">Cannot be empty</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="flex flex-column flex-center">
                <Form.Label htmlFor="updateCmd">
                    Update command
                </Form.Label>
                <Form.Control
                    id="updateCmd"
                    name="updateCmd"
                    type="text"
                    defaultValue={props.data.updateCmd}
                />
            </Form.Group>
            <Form.Group className="flex flex-column flex-center">
                <span>
                    <Form.Label htmlFor="killDelay">
                        Kill Delay
                    </Form.Label>
                    <InfoTooltip
                        text="Amount of time (in seconds) to wait before forcefully terminating the server"
                    />
                </span>
                <Form.Control
                    id="killDelay"
                    name="killDelay"
                    type="number"
                    min={0}
                    max={30}
                    step={0.5}
                    defaultValue={props.data.killDelay}
                />
                <Form.Control.Feedback type="invalid">Must be between 0 and 30.</Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
                <Button variant="primary" type="submit" block>
                    Update
                </Button>
                <Button variant="danger" type="reset" onClick={onDelete} block>
                    {deleteText}
                </Button>
            </Form.Group>
        </BaseForm>
    )
}

GeneralSettingsForm.propTypes = {
    categories: PropTypes.arrayOf(PropTypes.object).isRequired,
    data: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
}


function ModeSettingsForm(props) {
    const modeMap = props.data.modeMap;
    const [editing, setEditing] = useState(null);

    let modes = Object.keys(modeMap).map((key) => {
        if (editing === key) {
            return (
                <tr key={key} className="mode-display">
                    <Form.Control
                        name="name"
                        id="edit-mode-name"
                        placeholder="Name"
                        type="text"
                        className="text-center"
                        defaultValue={key}
                    />
                    <Form.Control
                        name="arguments"
                        id="edit-mode-arguments"
                        placeholder="Arguments"
                        type="text"
                        className="text-center"
                        defaultValue={modeMap[key]}

                    />
                    <td headers="mode-options" className="flex-center">
                        <Button key="editing" type="submit">Update</Button>
                        <Button
                            key="cancel"
                            variant="danger"
                            type="reset"
                            onClick={() => {setEditing(null)}}>Cancel</Button>
                    </td>
                </tr>
            )
        }
        return (
            <tr key={key} className="mode-display">
                <td headers="mode-name" className="flex-center">{key}</td>
                <td headers="mode-arguments" className="flex-center">{modeMap[key]}</td>
                <td headers="mode-options" className="flex-center">
                    <Button variant="link" type="reset" onClick={() => {
                        setEditing(key)
                    }}>
                        Edit
                    </Button>
                    <Button variant="link" type="reset" onClick={() => {props.onDelete({name:key})}}>
                        Delete
                    </Button>
                </td>
            </tr>
        )
    });

    // If no modes, place a warning that there are no modes configured.
    if (modes.length === 0) {
        modes = (
            <tr>
                <td colSpan={3}>No configured launch modes...</td>
            </tr>
        )
    }

    return (
        <div id="mode-editing" className="text-center">
            {/* New mode form */}
            <BaseForm
                onSubmit={props.onAdd}
                className="mode-display"
                autofill="off"
            >
                <Form.Control
                    id="new-mode-name"
                    name="name"
                    placeholder="Name"
                    required
                />
                <Form.Control
                    id="new-mode-arguments"
                    name="arguments"
                    placeholder="Arguments"
                    required
                />
                <Button type="submit" variant="primary">
                    Add
                </Button>
            </BaseForm>
            {/* Edit mode form */}
            <BaseForm
                onSubmit={(data) => props.onEdit({originalName: editing, arguments: modeMap[editing], ...data})}
                onReset={() => {setEditing(null)}}
            >
                <table className="modes-table">
                    <thead className="mode-display">
                        <th id="mode-name">Name</th>
                        <th id="mode-arguments">Arguments</th>
                        <th id="mode-options">Options</th>
                    </thead>
                    <tbody>
                        {modes}
                    </tbody>
                </table>
            </BaseForm>
        </div>
    );
}

ModeSettingsForm.propTypes = {
    data: PropTypes.object,
    onAdd: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
}


function ArgumentSettingsForm(props) {
    const modeMap = props.data.modeMap;

    const modeOptions = Object.keys(modeMap).map((key) => {
        return (<option value={key}>{key}</option>)
    });

    return (
        <div id="argument-editing-form" className="text-center">
            <BaseForm
                onSubmit={props.onSubmit}
                autofill="off"
            >
                <Form.Group>
                    <span>
                        <Form.Label
                            htmlFor="edit-default-args"
                        >
                            Default arguments
                        </Form.Label>
                        <InfoTooltip text="Arguments that will always be supplied before any other arguments"/>
                    </span>
                    <Form.Control
                        name="defaultArgs"
                        id="edit-default-args"
                        defaultValue={props.data.defaultArgs}
                    />
                </Form.Group>

                <Form.Group>
                    <span>
                        <Form.Label
                            htmlFor="edit-unspecified-args"
                        >
                            Unspecified arguments
                        </Form.Label>
                        <InfoTooltip text="The arguments that will be supplied if some for the current mode cannot be found."/>
                    </span>
                    <Form.Control
                        name="unspecifiedArgs"
                        id="edit-unspecified-args"
                        defaultValue={props.data.unspecifiedArgs}
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label
                        htmlFor="edit-current-mode"
                    >
                        Current mode
                    </Form.Label>
                    <Form.Control
                        name="mode"
                        id="edit-current-mode"
                        as="select"
                        defaultValue={props.data.mode}
                    >
                        <option>None</option>
                        {modeOptions}
                    </Form.Control>
                </Form.Group>

                <Button type="submit" block>Update</Button>
            </BaseForm>
        </div>
    );
}

ArgumentSettingsForm.propTypes = {
    data: PropTypes.object,
    onSubmit: PropTypes.func.isRequired
}


export function UpdateServerModalForm(props) {
    return (
        <Modal
            show={props.show}
            onHide={props.onClose}
            size="lg"
        >
            <Modal.Header>
                <h2>Server Settings</h2>
            </Modal.Header>
            <Tabs defaultActiveKey="general" fill justify>
                <Tab eventKey="general" title="General">
                    <GeneralSettingsForm
                        categories={props.categories}
                        data={props.data}
                        onSubmit={props.onGeneralSubmit}
                        onDelete={props.onDelete}
                    />
                </Tab>
                <Tab eventKey="modes" title="Launch Arguments">
                    <Accordion defaultActiveKey="0" className="modal-body">
                        <Card>
                            <Card.Header>
                                <Accordion.Toggle as={Button} eventKey="0" variant="link">
                                    Argument Settings
                                </Accordion.Toggle>
                            </Card.Header>
                            <Accordion.Collapse eventKey="0">
                                <Card.Body>
                                    <ArgumentSettingsForm
                                        data={props.data}
                                        onSubmit={props.onArgumentsSubmit}
                                    />
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                        <Card>
                            <Card.Header>
                                <Accordion.Toggle as={Button} eventKey="1" variant="link">
                                    Modes
                                </Accordion.Toggle>
                            </Card.Header>
                            <Accordion.Collapse eventKey="1">
                                <Card.Body>
                                    <ModeSettingsForm
                                        data={props.data}
                                        onAdd={props.onModeAdd}
                                        onEdit={props.onModeEdit}
                                        onDelete={props.onModeDelete}
                                    />
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    </Accordion>
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

UpdateServerModalForm.propTypes = {
    categories: PropTypes.arrayOf(PropTypes.object).isRequired,

    data: PropTypes.object,
    show: PropTypes.bool,
    onClose: PropTypes.func.isRequired,

    onGeneralSubmit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,

    onArgumentsSubmit: PropTypes.func.isRequired,

    onModeAdd: PropTypes.func.isRequired,
    onModeEdit: PropTypes.func.isRequired,
    onModeDelete: PropTypes.func.isRequired
}

UpdateServerModalForm.defaultProps = {
    data: {
        name: "",
        startCmd: "",
        updateCmd: "",

        mode: "",
        modeMap: {},

        defaultArgs: "",
        unspecifiedArgs: "",
        killDelay: 0
    },
    show: false
}
