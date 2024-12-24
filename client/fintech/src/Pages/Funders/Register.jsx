import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiGithub, FiLinkedin } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    uploadedFile: null
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'uploadedFile') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    if (formData.uploadedFile) {
      data.append('uploadedFile', formData.uploadedFile);
    }

    try {
      const response = await axios.post('http://localhost:8000/api/funder/register', data, {
        withCredentials: true,
      });

      console.log('Registration successful:', response.data);

      // Store funder data in localStorage
      localStorage.setItem('funderData', JSON.stringify({
        name: formData.name,
        email: formData.email,
      }));

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
      setLoading(false);
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
              <h2 className="auth-title">Join as a Funder</h2>
              <p className="auth-subtitle">Create your account to start investing in promising startups</p>
            </div>

            {error && <div className="error-message mb-3">{error}</div>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="form-floating mb-3">
                <Form.Control
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="name">Full Name</label>
              </Form.Group>

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

              <Form.Group className="form-floating mb-3">
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Control
                  type="file"
                  name="uploadedFile"
                  onChange={handleChange}
                  className="form-control"
                />
              </Form.Group>

              <Button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Form>

            <div className="divider">
              <span>or register with</span>
            </div>

            <div className="social-login">
              <button className="social-button mb-2">
                <FcGoogle />
                Continue with Google
              </button>
              <button className="social-button mb-2">
                <FiGithub />
                Continue with GitHub
              </button>
              <button className="social-button">
                <FiLinkedin />
                Continue with LinkedIn
              </button>
            </div>

            <div className="auth-links">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;