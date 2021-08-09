import {Navigation} from "../components/Navigation";
import PropTypes from "prop-types";

export function SettingsPage(props) {
    return (
        <article className="page">
            <Navigation
                user={props.user}
                onLogout={props.onLogout}
            />
        </article>
    )
}

SettingsPage.propTypes = {
    user: PropTypes.object,
    onLogout: PropTypes.func.isRequired,
    auth: PropTypes.object
}
