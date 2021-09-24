import {Button} from "react-bootstrap";
import {ChangeUsernameModal} from "./ChangeUsernameModal";
import api from "../../../../api/api";
import {useState} from "react";
import {ChangePasswordModal} from "./ChangePasswordModal";
import {ConfirmDeleteModal} from "../../../components/ConfirmDeleteModal";

export function SettingsPanel(props) {
    const [show, setShow] = useState("none");

    return (
        <div className="flex flex-column flex-center">
            {/* Modal forms */}
            <ChangeUsernameModal
                onSubmit={(data) => {
                    api.auth.modifyCurrentUser(data).then();
                }}
                show={show === "changeUsername"}
                onHide={() => {setShow("none")}}
                data={props.user}
            />
            <ChangePasswordModal
                onSubmit={(data) => {
                    api.auth.modifyCurrentUser(data).then();
                }}
                show={show === "changePassword"}
                onHide={() => {setShow("none")}}
                data={props.user}
            />
            <ConfirmDeleteModal
                onConfirm={() => {
                    api.auth.deleteCurrentUser().then(() => {
                        setShow("none");
                    });
                }}
                show={show === "confirmDelete"}
                onCancel={() => setShow("none")}
                onHide={() => setShow("none")}
            />

            {/* User options */}
            <h2 className="greeting text-capitalize">Hello {props.user.name}</h2>

            <Button
                variant="primary"
                block={true}
                onClick={() => {setShow("changeUsername")}}
            >
                Change Username
            </Button>
            <Button
                variant="primary"
                block={true}
                onClick={() => {setShow("changePassword")}}
            >
                Change Password
            </Button>
            <Button
                variant="danger"
                block={true}
                onClick={() => {setShow("confirmDelete")}}
            >
                Delete User
            </Button>
        </div>
    )
}