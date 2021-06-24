import React from "react";
import { Navigation } from "./components";

export class ServersPage extends React.Component {
    render() {
        const servers = this.props.servers;
        const username = this.props.username;
        const logoutAction = this.props.logoutAction;

        return (
            <article className="page">
                <Navigation
                    activeKey="/servers"
                    servers={servers}
                    username={username}
                    logoutAction={logoutAction}
                />
            </article>
        )
    }
}
