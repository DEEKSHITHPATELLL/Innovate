import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PeopleLogin.css';

const PeopleLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear messages when user starts typing
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/people/login', formData, {
        withCredentials: true,
      });

      setSuccess(response.data.message);
      setError('');

      setTimeout(() => {
        navigate('/peoplehome');
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'An error occurred');
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="login-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={6} lg={4}>
          <div className="login-card">
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p className="text-muted">Sign in to continue to your account</p>
            </div>

            <Form onSubmit={handleSubmit} className="login-form">
              {error && (
                <Alert variant="danger" className="alert-message">
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" className="alert-message">
                  {success}
                </Alert>
              )}

              <Form.Group className="form-group">
                <div className="input-icon-wrapper">
                  <FaEnvelope className="input-icon" />
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                  />
                </div>
              </Form.Group>

              <Form.Group className="form-group">
                <div className="input-icon-wrapper">
                  <FaLock className="input-icon" />
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                  />
                </div>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <>
                    <FaSignInAlt className="button-icon" />
                    <span>Sign In</span>
                  </>
                )}
              </Button>
            </Form>

            <div className="login-footer">
              <p className="text-center mb-0">
                Don't have an account?{' '}
                <Link to="/peopleregister" className="register-link">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PeopleLogin;