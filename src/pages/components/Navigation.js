import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import {Link} from "react-router-dom";
import PropTypes from 'prop-types';
import "../styles/Navigation.css"

export function ServerNavigation(props) {
    let servers = []
    if (props.servers) {
        servers = props.servers.map((name) => {
            const url = "/servers/" + name;
            return (
                <Nav.Item key={name}>
                    <Nav.Link as={Link} className="text-capitalize" eventKey={name} to={url}>{name}</Nav.Link>
                </Nav.Item>
            )
        });
    }

    const locationSplit = decodeURI(window.location.pathname).split("/");
    const activeKey = locationSplit[locationSplit.length - 1];

    return (
        <header>
            <Nav
                variant="pills"
                activeKey={activeKey}
                className="flex-column bg-white sidebar"
            >
                <Nav.Item>
                    {servers}
                </Nav.Item>
            </Nav>
        </header>
    )
}

ServerNavigation.propTypes = {
    servers: PropTypes.arrayOf(PropTypes.string).isRequired
}


export function Navigation(props) {
    const loggedInMessage = (props.user) ? "Logged in as: " + props.user.name : "Logged in";
    const onLogout = props.onLogout;

    return (
        <header>
            <Navbar bg="white">
                <Navbar.Brand>
                    GS-Manager
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} className="text-capitalize" to="/servers">
                            Servers
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                <Navbar.Collapse className="justify-content-end">
                    <Nav className="me-auto">
                        <NavDropdown id="user-info" title={loggedInMessage} alignRight={true}>
                            <NavDropdown.Item onClick={onLogout}>
                                Logout
                            </NavDropdown.Item>
                            <NavDropdown.Divider/>
                            <NavDropdown.Item as={Link} to="/user-management">
                                User management
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </header>
    );
}

Navigation.propTypes = {
    user: PropTypes.object,
    onLogout: PropTypes.func.isRequired
}
