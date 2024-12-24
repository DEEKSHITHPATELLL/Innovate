import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Offcanvas } from 'react-bootstrap';
import { FiMenu, FiHome, FiUsers, FiDollarSign, FiMessageCircle, FiMap } from 'react-icons/fi';

const NavigationBar = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="fixed-top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <FiDollarSign className="me-2" size={24} />
            <span className="fw-bold">FinTech Hub</span>
          </Navbar.Brand>
          <Button variant="outline-light" className="d-lg-none" onClick={handleShow}>
            <FiMenu />
          </Button>
          <Nav className="d-none d-lg-flex ms-auto">
            <Nav.Link as={Link} to="/" className="mx-2">
              <FiHome className="me-1" /> Home
            </Nav.Link>
            <Nav.Link as={Link} to="/Funders" className="mx-2">
              <FiUsers className="me-1" /> Funders
            </Nav.Link>
            <Nav.Link as={Link} to="/startuphome" className="mx-2">
              <FiDollarSign className="me-1" /> Startups
            </Nav.Link>
            <Nav.Link as={Link} to="/map" className="mx-2">
              <FiMap className="me-1" /> Map
            </Nav.Link>
            <Nav.Link as={Link} to="/chat" className="mx-2">
              <FiMessageCircle className="me-1" /> Chat
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/" onClick={handleClose}>
              <FiHome className="me-2" /> Home
            </Nav.Link>
            <Nav.Link as={Link} to="/Funders" onClick={handleClose}>
              <FiUsers className="me-2" /> Funders
            </Nav.Link>
            <Nav.Link as={Link} to="/startuphome" onClick={handleClose}>
              <FiDollarSign className="me-2" /> Startups
            </Nav.Link>
            <Nav.Link as={Link} to="/map" onClick={handleClose}>
              <FiMap className="me-2" /> Map
            </Nav.Link>
            <Nav.Link as={Link} to="/chat" onClick={handleClose}>
              <FiMessageCircle className="me-2" /> Chat
            </Nav.Link>
            <Button variant="dark" className="mt-3" onClick={() => {
              handleClose();
              navigate('/Login');
            }}>
              Login
            </Button>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default NavigationBar;
