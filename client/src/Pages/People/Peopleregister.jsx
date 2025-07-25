import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Peopleregister.css';

const Peopleregister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userExists, setUserExists] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/people/register', formData, {
        withCredentials: true,
      });

      setSuccess(response.data.message);
      setError('');
      setUserExists(false);

      setTimeout(() => {
        navigate('/peoplehome');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'An error occurred');
      setSuccess('');

      if (error.response?.data?.error === 'User already exists') {
        setUserExists(true);
      }
    }
  };

  return (
    <div className="register-page">
      <motion.div 
        className="register-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="register-content">
          <motion.div 
            className="register-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1>Join Our Community</h1>
            <p>Connect with startups and funders around the world</p>
            <div className="features">
              <div className="feature-item">
                <span className="feature-icon">🚀</span>
                <p>Discover innovative startups</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💡</span>
                <p>Connect with potential investors</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🤝</span>
                <p>Build valuable partnerships</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="register-right"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="form-container">
              <h2>Register</h2>
              {success && <div className="success-message">{success}</div>}
              {error && <div className="error-message">{error}</div>}
              {userExists && (
                <div className="user-exists-message">
                  This email is already registered. 
                  <a href="/peoplelogin" className="login-link">Go to Login</a>
                </div>
              )}
              <form onSubmit={handleSubmit} className="register-form">
                <div className="input-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <motion.button 
                  type="submit" 
                  className="register-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Register
                </motion.button>
              </form>
              <div className="already-registered">
                <p>Already registered? <a href="/peoplelogin" className="login-link">Login here</a></p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Peopleregister;