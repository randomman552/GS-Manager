import React from "react";
import {Route, Switch} from "react-router-dom";
import "./ServersPage.css"
import {ServerListing} from "./components/listing/ServerListing";
import {ServerDashboard} from "./components/dashboard/ServerDashboard";
import api from "../../api/api";
import {LoaderWrapper} from "../components/LoaderWrapper";


export class ServersPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            servers: null,
            categories: null
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
                            const curServer = api.servers.data.get(serverID);

                            return (
                                <LoaderWrapper
                                    render={!!curServer}
                                    timeout={1000}
                                >
                                    <ServerDashboard
                                        {...props}
                                        key={serverID}
                                        server={curServer}
                                        categories={categories}
                                    />
                                </LoaderWrapper>
                            );
                        }}
                    />
                    <Route
                        exact path="/servers"
                        render={(props) => {
                            return (
                                <LoaderWrapper
                                    render={!!servers && !!categories}
                                >
                                    <ServerListing
                                        {...props}
                                        servers={servers}
                                        categories={categories}
                                    />
                                </LoaderWrapper>
                            );
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
        api.categories.removeChangeListener(this.onServerChange);
        api.servers.removeChangeListener(this.onCategoryChange);
    }
}
