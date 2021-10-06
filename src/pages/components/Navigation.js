import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import {Link} from "react-router-dom";
import PropTypes from 'prop-types';
import "./Navigation.css"


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
                        <Nav.Link as={Link} className="text-capitalize" to="/system">
                            System
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
                            <NavDropdown.Item as={Link} to="/settings">
                                Settings
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
