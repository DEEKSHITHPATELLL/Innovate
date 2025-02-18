import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/funder/register', formData, {
        withCredentials: true,
      });

      setSuccess(response.data.message);
      setError('');
      setUserExists(false);

      setTimeout(() => {
        navigate('/funders');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'An error occurred');
      setSuccess('');

      if (error.response?.data?.error === 'User already exists') {
        setUserExists(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="startup-register">
      <Container fluid>
        <Row className="min-vh-100">
          <Col md={6} className="left-panel d-flex flex-column justify-content-between">
            <div className="brand-section">
              <h1 className="display-3 mb-4">Innovate</h1>
              <p className="lead">Empowering Financial Innovation</p>
            </div>
            <div className="info-section">
              <h2>Join Our Platform</h2>
              <p>Create an account to start your investment journey</p>
            </div>
          </Col>
          <Col md={6} className="right-panel">
            <div className="register-form-container">
              <div className="register-header">
                <h2>Create Account</h2>
                <p>Fill in your details to get started</p>
              </div>

              {error && <Alert variant="danger" className="animate__animated animate__fadeIn">{error}</Alert>}
              {success && <Alert variant="success" className="animate__animated animate__fadeIn">{success}</Alert>}
              {userExists && (
                <Alert variant="warning" className="animate__animated animate__fadeIn">
                  User already exists. Please try a different email.
                </Alert>
              )}

              <Form onSubmit={handleSubmit} className="register-form">
                <Form.Group className="mb-4">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    label="I agree to the Terms of Service and Privacy Policy"
                    required
                    className="custom-checkbox"
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  className="register-btn w-100" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <div className="login-prompt mt-4">
                  Already have an account?{' '}
                  <Link to="/login" className="login-link">
                    Sign in
                  </Link>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
