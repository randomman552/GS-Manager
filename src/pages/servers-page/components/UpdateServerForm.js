import React, {useState} from "react";
import {Accordion, Button, Card, Form, Modal, Tab, Tabs} from "react-bootstrap";
import PropTypes from "prop-types";
import {BaseForm, onChangeFactory} from "../../components/BaseForm";


function GeneralSettingsForm(props) {
    const [data, setData] = useState(props.data);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const onDelete = (confirmDelete) ? props.onDelete : () => {setConfirmDelete(true)};
    const deleteText = (confirmDelete) ? "Confirm delete? (this is irreversible)" : "Delete";

    const categoryOptions = props.categories.map((category) => {
        return (<option value={category.id}>{category.name}</option>)
    })

    return (
        <BaseForm
            onSubmit={props.onSubmit}
            onChange={onChangeFactory(data, setData)}
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
                    value={data.name}
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
                    value={data.category}
                >
                    <option value="">None</option>
                    {categoryOptions}
                </Form.Control>
            </Form.Group>
            <Form.Group className="flex flex-column flex-center">
                <Form.Label htmlFor="start_cmd">
                    Start command
                </Form.Label>
                <Form.Control
                    id="start_cmd"
                    name="start_cmd"
                    type="text"
                    value={data.start_cmd}
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
                    value={data.update_cmd}
                />
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
    const mode_map = props.data.mode_map;
    const [editing, setEditing] = useState(null);
    const [data, setData] = useState({});

    let modes = Object.keys(mode_map).map((key) => {
        if (editing === key) {
            return (
                <tr key={key} className="mode-display">
                    <Form.Control
                        name="name"
                        id="edit-mode-name"
                        placeholder="Name"
                        type="text"
                        className="text-center"
                        value={data.name}
                    />
                    <Form.Control
                        name="arguments"
                        id="edit-mode-arguments"
                        placeholder="Arguments"
                        type="text"
                        className="text-center"
                        value={data.arguments}

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
                <td headers="mode-arguments" className="flex-center">{mode_map[key]}</td>
                <td headers="mode-options" className="flex-center">
                    <Button variant="link" type="reset" onClick={() => {
                        setEditing(key)
                        setData({
                            name: key,
                            arguments: mode_map[key]
                        })
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
                onSubmit={(data) => props.onEdit({originalName: editing, arguments: mode_map[editing], ...data})}
                onReset={() => {setEditing(null)}}
                onChange={onChangeFactory(data, setData)}
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
    const [data, setData] = useState(props.data);
    const modeMap = props.data.mode_map;

    const modeOptions = Object.keys(modeMap).map((key) => {
        return (<option value={key}>{key}</option>)
    });

    return (
        <div id="argument-editing-form" className="text-center">
            <BaseForm
                onSubmit={props.onSubmit}
                onChange={onChangeFactory(data, setData)}
                autofill="off"
            >
                <Form.Group>
                    <Form.Label
                        htmlFor="edit-default-args"
                    >
                        Default arguments
                    </Form.Label>
                    <Form.Control
                        name="default_args"
                        id="edit-default-args"
                        value={data.default_args}
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label
                        htmlFor="edit-unspecified-args"
                    >
                        Unspecified arguments (used when mode not found)
                    </Form.Label>
                    <Form.Control
                        name="unspecified_args"
                        id="edit-unspecified-args"
                        value={data.unspecified_args}
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
                        value={data.mode}
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

UpdateServerForm.propTypes = {
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

UpdateServerForm.defaultProps = {
    data: {
        name: "",
        start_cmd: "",
        update_cmd: "",

        mode: "",
        mode_map: {}
    },
    show: false
}
