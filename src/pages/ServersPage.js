import React from "react";
import { Navigation } from "./components";


class ServerDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "name": this.props.name,
            "user": this.props.user
        };
    }

    render() {
        return (
            <article id={this.state.name} className="server-dashboard">

            </article>
        );
    }
}

export function ServersPage(props) {
    const servers = props.servers;
    const user = props.user;
    const logoutAction = props.logoutAction;
    const serverName = props.match.params.serverName;

    return (
        <article className="page">
            <Navigation
                activeKey="/servers"
                servers={servers}
                user={user}
                logoutAction={logoutAction}
            />
            <ServerDashboard name={serverName} user={user} />
        </article>
    )
}
