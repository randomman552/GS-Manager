import React from "react";
import api from "../../../../api/api";
import {Button} from "react-bootstrap";
import {UserForm} from "./UserForm";
import {ConfirmDeleteModal} from "../../../components/ConfirmDeleteModal";

class AdminUserSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],

            showModal: false,
            modalData: undefined,

            showDeleteModal: false,
            deleteModalUserID: undefined,
        }
    }


    showUserModal(data) {
        this.setState({
            showModal: true,
            modalData: data
        });
    }

    hideUserModal() {
        this.setState({
            showModal: false
        });
    }


    showDeleteModal(userID) {
        this.setState({
            showDeleteModal: true,
            deleteModalUserID: userID
        });
    }

    hideDeleteModal() {
        this.setState({
            showDeleteModal: false,
            deleteModalUserID: undefined
        });
    }



    updateUser(data) {
        if (this.state.modalData)
            api.auth.modify(this.state.modalData.id, data).then()
        else
            api.auth.create(data).then()
    }

    deleteUser(userID) {
        api.auth.delete(userID).then()
    }


    render() {
        const users = this.state.users;
        let usersDisplay = users.map((user => {
            return (
                <tr className="user-entry" key={user.id}>
                    <td headers="username">
                        {user.name}
                    </td>
                    <td headers="admin">
                        {(user.is_admin) ? "yes" : "no"}
                    </td>
                    <td headers="options">
                        <Button
                            variant="link"
                            onClick={() => {this.showUserModal(user)}}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="link"
                            onClick={() => {this.showDeleteModal(user.id)}}
                        >
                            Delete
                        </Button>
                    </td>
                </tr>
            )
        }));
        if (usersDisplay.length === 0)
            usersDisplay = <div>There are no users</div>

        return (
            <div className="container-md" id="admin-user-settings">
                <UserForm
                    onSubmit={(data) => {this.updateUser(data)}}

                    data={this.state.modalData}

                    show={this.state.showModal}
                    onHide={() => {this.hideUserModal()}}
                />

                <ConfirmDeleteModal
                    show={this.state.showDeleteModal}
                    onHide={() => {this.hideDeleteModal()}}
                    onCancel={() => {this.hideDeleteModal()}}

                    onConfirm={() => {
                        this.deleteUser(this.state.deleteModalUserID);
                        this.hideDeleteModal();
                    }}
                />

                <h1>Users</h1>
                <table className="user-listing">
                    <div className="user-entry">
                        <th className="user-name font-weight-bold" id="username">
                            Username
                        </th>
                        <th className="user-admin font-weight-bold" id="admin">
                            Has Admin?
                        </th>
                        <th className="user-options font-weight-bold" id="options">
                            Options
                        </th>
                    </div>
                    <tbody>
                        {usersDisplay}
                        <tr  className="flex flex-center">
                            <td colSpan={3}><Button onClick={() => {this.showUserModal()}}>Add</Button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }


    componentDidMount() {
        // Whenever a user is changed in the cache, we re-render this component.
        const userUpdateFunc = (users) => {
            this.setState({
                users
            });
        }
        api.auth.addChangeListener(userUpdateFunc);
        this.componentWillUnmount = () => {
            api.auth.removeChangeListener(userUpdateFunc)
        }
        api.auth.get().then();
    }
}

export function AdminSettingsPanel(props) {
    return (
        <>
            <AdminUserSettings/>
        </>
    );
}
