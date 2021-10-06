import {SystemDashboard} from "./components/SystemDashboard";
import {LoaderWrapper} from "../components/LoaderWrapper";
import React from "react";
import api from "../../api/api";

export class SystemPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            systemInfo: null
        }
    }


    render() {
        const systemInfo = this.state.systemInfo;
        return (
            <LoaderWrapper
                render={systemInfo}
            >
                <SystemDashboard
                    systemInfo={systemInfo}
                />
            </LoaderWrapper>
        )
    }


    updateSystemInfo() {
        api.system.getSystemInfo().then(json => {
            this.setState({
                systemInfo: json.data
            });
        });
    }

    componentDidMount() {
        this.updateSystemInfo();
        this.interval = setInterval(() => {this.updateSystemInfo()}, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        delete this.interval;
    }
}
