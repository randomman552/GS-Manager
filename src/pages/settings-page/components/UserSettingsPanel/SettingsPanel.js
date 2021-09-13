import {Button} from "react-bootstrap";
import {ChangeUsernameForm} from "./ChangeUsernameForm";
import api from "../../../../api/api";
import {useState} from "react";
import {ChangePasswordForm} from "./ChangePasswordForm";
import {ConfirmDeleteModal} from "../ConfirmDeleteModal";

export function SettingsPanel(props) {
    const [show, setShow] = useState("none");

    return (
        <div className="flex flex-column flex-center">
            {/* Modal forms */}
            <ChangeUsernameForm
                onSubmit={(data) => {
                    api.auth.modifyCurrentUser(data).then();
                }}
                show={show === "changeUsername"}
                onHide={() => {setShow("none")}}
                data={props.user}
            />
            <ChangePasswordForm
                onSubmit={(data) => {
                    api.auth.modifyCurrentUser(data).then();
                }}
                show={show === "changePassword"}
                onHide={() => {setShow("none")}}
                data={props.user}
            />
            <ConfirmDeleteModal
                onConfirm={() => {
                    api.auth.deleteCurrentUser().then();
                }}
                show={show === "confirmDelete"}
                onCancel={() => setShow("none")}
                onHide={() => setShow("none")}
            />

            {/* User options */}
            <h2 className="greeting">Hello '{props.user.name}'!</h2>

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