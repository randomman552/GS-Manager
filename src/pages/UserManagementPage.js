import {Navigation} from "./components/Navigation";
import PropTypes from "prop-types";

export function UserManagementPage(props) {
    return (
        <article className="page">
            <Navigation
                user={props.user}
                onLogout={props.onLogout}
            />
        </article>
    )
}

UserManagementPage.propTypes = {
    user: PropTypes.object,
    onLogout: PropTypes.func.isRequired,
    auth: PropTypes.object
}
