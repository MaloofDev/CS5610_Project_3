import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import useUser from "../context/useUser.js";
import "./NavBar.css";

const LINKS = [
  ["/runs", "Runs"],
  ["/dashboard", "Dashboard"],
  ["/releases", "Releases"],
  ["/issues", "Known issues"],
  ["/match", "Match an error"],
];

export default function NavBar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <Navbar
      expand="md"
      bg="dark"
      data-bs-theme="dark"
      className="warden-nav"
      collapseOnSelect
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          Warden
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="warden-nav-links" />
        <Navbar.Collapse id="warden-nav-links">
          <Nav className="me-auto">
            {LINKS.map(([to, label]) => (
              <Nav.Link key={to} as={NavLink} to={to} eventKey={to}>
                {label}
              </Nav.Link>
            ))}
          </Nav>
          <Nav className="warden-nav__user">
            {user ? (
              <>
                <Navbar.Text className="warden-nav__username">
                  {user.username}
                </Navbar.Text>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" eventKey="/login">
                  Log in
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register" eventKey="/register">
                  Sign up
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
