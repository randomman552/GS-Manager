import React from "react";
import api from "../../../api/api";
import {Button} from "react-bootstrap";

class AdminUserSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: []
        }
    }


    render() {
        api.auth.getUsers().then((data => {
            this.setState({
                users: data.data
            })
        }));

        const users = this.state.users;
        let usersDisplay = users.map((user => {
            return (
                <tr className="user-entry">
                    <td headers="userID">
                        {user.id}
                    </td>
                    <td headers="username">
                        {user.name}
                    </td>
                    <td headers="options">
                        <Button
                            onClick={() => {}}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => {}}
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
                <h1>Users</h1>
                <table className="user-listing">
                    <thead className="user-entry">
                        <th className="user-name font-weight-bold" id="userID">
                            User ID
                        </th>
                        <th className="user-name font-weight-bold" id="username">
                            Username
                        </th>
                        <th className="user-options font-weight-bold" id="options">
                            Options
                        </th>
                    </thead>
                    <tbody>
                        {usersDisplay}
                    </tbody>
                </table>
            </div>
        );
    }
}

export function AdminSettingsPanel(props) {
    return (
        <>
            <AdminUserSettings/>
        </>
    );
}
