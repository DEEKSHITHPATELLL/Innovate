import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userExists, setUserExists] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
   
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/funder/login', formData, {
        withCredentials: true, 
      });

      setSuccess(response.data.message);  
      setError('');  
      setTimeout(() => {
        navigate('/funders');
      }, 2000);
    } catch (error) {
      console.error('Login error:', error); 
      setError(error.response?.data?.error || 'An error occurred'); 
      setSuccess('');
    }
  };

  return (
    <div className="startup-login">
      <Container fluid>
        <Row>
          <Col md={6} className="left-panel">
            <div className="brand-section">
              <h1>Innovate</h1>
              <p>Empowering Financial Innovation</p>
            </div>
            <div className="info-section">
              <h2>Welcome Back!</h2>
              <p>Login to access your investment dashboard</p>
            </div>
          </Col>
          <Col md={6} className="right-panel">
            <div className="login-form-container">
              <div className="login-header">
                <h2>Sign In</h2>
                <p>Enter your credentials to continue</p>
              </div>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <div className="form-options mb-4">
                  <Form.Check
                    type="checkbox"
                    label="Remember me"
                    className="remember-me"
                  />
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot Password?
                  </Link>
                </div>

                <Button type="submit" className="login-btn">
                  Sign In
                </Button>

                <div className="register-prompt">
                  Don't have an account?{' '}
                  <Link to="/register" className="register-link">
                    Sign up
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

export default Login;