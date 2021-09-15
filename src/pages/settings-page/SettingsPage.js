import PropTypes from "prop-types";
import {SettingsPanel} from "./components/UserSettingsPanel/SettingsPanel";
import {AdminSettingsPanel} from "./components/AdminSettingsPanel/AdminSettingsPanel";
import {Tab, Tabs} from "react-bootstrap";

import "./SettingsPage.css"

export function SettingsPage(props) {
    return (
        <article className="page">
            <Tabs
                defaultActiveKey="settings"
                id="settings-tab-container"
                className="container-md"
                fill justfiy
            >
                <Tab
                    eventKey="settings"
                    title="Settings"
                    className="container-md text-center"
                >
                    <SettingsPanel
                        user={props.user}
                    />
                </Tab>

                <Tab
                     eventKey="admin-settings"
                     title="Admin"
                     className="container-md text-center"
                     disabled={!props.user.is_admin}
                >
                    <AdminSettingsPanel/>
                </Tab>
            </Tabs>
        </article>
    )
}

SettingsPage.propTypes = {
    user: PropTypes.object,
    auth: PropTypes.object
}
