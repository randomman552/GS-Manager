import React from "react";
import {Route, Switch} from "react-router-dom";
import "./ServersPage.css"
import {ServerListing} from "./components/ServerListing";
import {ServerDashboard} from "./components/ServerDashboard";
import api from "../../api/api";


export class ServersPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            servers: [],
            categories: []
        }
    }


    render() {
        const servers = this.state.servers;
        const categories = this.state.categories;

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
                                    server={curServer}
                                />
                            )
                        }}
                    />
                    <Route
                        exact path="/servers"
                        render={(props) => {
                            return (<ServerListing {...props} servers={servers} categories={categories} />)
                        }}
                    />
                </Switch>
            </article>
        );
    }


    componentDidMount() {
        this.onServerChange = (servers) => {
            this.setState({
                servers
            });
        }
        this.onCategoryChange = (categories) => {
            this.setState({
                categories
            });
        }

        api.servers.addChangeListener(this.onServerChange)
        api.categories.addChangeListener(this.onCategoryChange)

        api.servers.get();
        api.categories.get();
    }

    componentWillUnmount() {
        api.categories.removeChangeListener(this.onServerChange)
            api.servers.removeChangeListener(this.onCategoryChange)
    }
}
