import React from "react";
import PropTypes from 'prop-types';
import {Route, Switch} from "react-router-dom";
import "./ServersPage.css"
import {ServerListing} from "./components/ServerListing";
import {ServerDashboard} from "./components/ServerDashboard";


export function ServersPage(props) {
    const servers = props.servers;
    const auth = props.auth;

    return (
        <article className="page">
            <Switch>
                <Route
                    path="/servers/:serverID"
                    render={(props) => {
                        const serverID = props.match.params.serverID;

                        let curServer;
                        for (const server of servers) {
                            if (server.id === serverID) {
                                curServer = server;
                                break;
                            }
                        }

                        return (
                            <ServerDashboard
                                {...props}
                                key={serverID}
                                auth={auth}
                                server={curServer}
                            />
                        )
                    }}
                />
                <Route
                    exact path="/servers"
                    render={(props) => {
                        return (<ServerListing {...props} auth={auth} servers={servers} />)
                    }}
                />
            </Switch>
        </article>
    );
}

ServersPage.propTypes = {
    servers: PropTypes.array,
    auth: PropTypes.object
}
