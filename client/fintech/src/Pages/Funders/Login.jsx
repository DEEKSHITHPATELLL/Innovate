import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiGithub, FiLinkedin } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userNotFound, setUserNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setUserNotFound(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setUserNotFound(false);

    try {
      console.log("Submitting form data:", formData);

      const response = await axios.post('http://localhost:8000/api/funder/login', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Login successful, response data:", response.data);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem(
        'funderData',
        JSON.stringify({
          name: response.data.user.name,
          email: response.data.user.email,
        })
      );

      setSuccess('Login successful! Redirecting...');
      setLoading(false);

      setTimeout(() => {
        navigate('/funders');
      }, 1500);
    } catch (error) {
      setLoading(false);
      console.error("Error during login:", error);

      if (error.response) {
        switch (error.response.status) {
          case 404:
            setUserNotFound(true);
            break;
          case 401:
            setError('Invalid email or password.');
            break;
          case 400:
            setError('Please provide both email and password.');
            break;
          default:
            setError('An unexpected error occurred. Please try again.');
        }
      } else if (error.request) {
        setError('No response from server. Please check your network connection.');
      } else {
        setError('Error setting up the request. Please try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="auth-card">
          <Card.Body>
            <div className="auth-header">
              <h2 className="auth-title">Welcome Back, Funder!</h2>
              <p className="auth-subtitle">Sign in to continue your investment journey</p>
            </div>

            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}
            {userNotFound && (
              <div className="user-not-found">
                <p>User does not exist.</p>
                <div className="register-message">
                  <span>Don't have an account?</span>
                  <Link to="/register" className="register-link">Sign up</Link>
                </div>
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="form-floating mb-3">
                <Form.Control
                  type="email"
                  name="email"
                  id="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="email">Email address</label>
              </Form.Group>

              <Form.Group className="form-floating mb-3">
                <Form.Control
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="password">Password</label>
              </Form.Group>

              <Button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Form>

            <div className="divider">
              <span>or continue with</span>
            </div>

            <div className="social-login">
              <button className="social-button mb-2">
                <FcGoogle />
                Sign in with Google
              </button>
              <button className="social-button mb-2">
                <FiGithub />
                Sign in with GitHub
              </button>
              <button className="social-button">
                <FiLinkedin />
                Sign in with LinkedIn
              </button>
            </div>

            <div className="auth-links">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Sign up
                </Link>
              </p>
              <Link to="/forgot-password" className="auth-link">
                Forgot your password?
              </Link>
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;