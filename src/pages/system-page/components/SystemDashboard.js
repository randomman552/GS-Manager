import React from "react";
import {UtilisationWidget} from "./UtilisationWidget";
import api from "../../../api/api";
import "./SystemDashboard.css";
import * as util from "util";

export class SystemDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            systemInfo: undefined
        };
    }


    render() {
        const systemInfo = this.state.systemInfo;
        // TODO: Add loading page for cases like this
        if (!systemInfo)
            return (<></>)

        // region Render disk utilisation widgets
        const diskUtilWidgets = [];
        for (const diskName in systemInfo.disks) {
            const disk = systemInfo.disks[diskName];

            // Skip sqaushfs volumes as they are likely created by snap
            if (disk.fileSystem === "squashfs")
                continue;

            diskUtilWidgets.push(
                <UtilisationWidget
                    title={diskName + " Capacity"}
                    // Convert to megabytes
                    current={disk.size.used  / Math.pow(1024, 2)}
                    maximum={disk.size.total  / Math.pow(1024, 2)}
                    units="mb"
                />
            )
        }
        // endregion

        return (
            <article className="system-dashboard">
                <h1 className="text-center">CPU Stats</h1>
                <article className="utilisation-container">
                    <UtilisationWidget
                        title="CPU Utilisation"
                        key="cpu-util"
                        current={systemInfo.cpu.utilisation}
                    />
                    <UtilisationWidget
                        title="CPU Clock Speed"
                        key="cpu-clock"
                        current={systemInfo.cpu.frequency.current}
                        maximum={systemInfo.cpu.frequency.max}
                        minimum={systemInfo.cpu.frequency.min}
                        units={"MHz"}
                        asPercent={false}
                    />
                </article>

                <h1 className="text-center">Memory Usage</h1>
                <article className="utilisation-container">
                    <UtilisationWidget
                        title="Memory Utilisation"
                        key="mem-util"
                        // Convert to megabytes
                        current={systemInfo.memory.used / Math.pow(1024, 2)}
                        maximum={systemInfo.memory.total / Math.pow(1024, 2)}
                        units={"mb"}
                    />
                    <UtilisationWidget
                        title="Swap Utilisation"
                        key="swap-util"
                        // Convert to megabytes
                        current={systemInfo.swap.used / Math.pow(1024, 2)}
                        maximum={systemInfo.swap.total / Math.pow(1024, 2)}
                        units="mb"
                    />
                </article>

                <h1 className="text-center">Disk Usage</h1>
                <article className="utilisation-container">
                    {diskUtilWidgets}
                </article>
            </article>
        );
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