import {Navigation} from "../components/Navigation";
import PropTypes from "prop-types";
import {SettingsPanel} from "./components/SettingsPanel";
import {AdminSettingsPanel} from "./components/AdminSettingsPanel";
import {Tab, Tabs} from "react-bootstrap";

export function SettingsPage(props) {
    return (
        <article className="page">
            <Navigation
                user={props.user}
                onLogout={props.onLogout}
            />
            <Tabs
                defaultActiveKey="settings"
                id="settings-tab-container"
                className="container-md"
            >
                <Tab eventKey="settings" title="Settings" className="container-md">
                    <SettingsPanel/>
                </Tab>

                <Tab eventKey="admin-settings" title="Admin Settings" className="container-md">
                    <AdminSettingsPanel/>
                </Tab>
            </Tabs>
        </article>
    )
}

SettingsPage.propTypes = {
    user: PropTypes.object,
    onLogout: PropTypes.func.isRequired,
    auth: PropTypes.object
}
