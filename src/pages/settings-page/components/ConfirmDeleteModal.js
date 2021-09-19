import {Button, Modal} from "react-bootstrap";
import PropTypes from "prop-types";


export function ConfirmDeleteModal(props) {
    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
        >
            <Modal.Header>
                <Modal.Title>Confirm Deletion?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                This action is irreversible!
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={props.onConfirm}>Confirm</Button>
                <Button variant="secondary" onClick={props.onCancel}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    )
}

ConfirmDeleteModal.propTypes = {
    show: PropTypes.bool,

    onHide: PropTypes.func,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func
}

ConfirmDeleteModal.defaultProps = {
    show: false
}
