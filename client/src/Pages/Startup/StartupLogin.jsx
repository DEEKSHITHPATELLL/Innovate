import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiGithub, FiLinkedin } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './StartupLogin.css';

const StartupLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/startup/login', formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      setSuccess('Login successful! Redirecting...');
      setError('');

      setTimeout(() => {
        navigate('/startuphome');
      }, 2000);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Invalid email or password');
      setSuccess('');
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="login-page">
      <motion.div 
        className="login-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="login-content">
          <motion.div 
            className="login-left"
            variants={itemVariants}
          >
            <h1>Welcome Back!</h1>
            <p className="subtitle">Sign in to continue your startup journey</p>
            
            <motion.div className="features">
              <motion.div className="feature-item" variants={itemVariants}>
                <div className="feature-icon">💡</div>
                <div className="feature-text">
                  <h3>Showcase</h3>
                  <p>Present your startup to potential investors</p>
                </div>
              </motion.div>
              
              <motion.div className="feature-item" variants={itemVariants}>
                <div className="feature-icon">🤝</div>
                <div className="feature-text">
                  <h3>Connect</h3>
                  <p>Network with investors and partners</p>
                </div>
              </motion.div>
              
              <motion.div className="feature-item" variants={itemVariants}>
                <div className="feature-icon">📈</div>
                <div className="feature-text">
                  <h3>Grow</h3>
                  <p>Take your startup to new heights</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="login-right"
            variants={itemVariants}
          >
            <div className="form-container">
              <h2>Sign In</h2>
              
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="success-message"
                  >
                    {success}
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="error-message"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <div
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </div>
                </div>

                <div className="form-options">
                  <label className="remember-me">
                    <input type="checkbox" /> Remember me
                  </label>
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot Password?
                  </Link>
                </div>

                <motion.button 
                  type="submit" 
                  className="login-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>

                <div className="divider">
                  <span>or continue with</span>
                </div>

                <div className="social-login">
                  <motion.button
                    type="button"
                    className="social-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FcGoogle />
                    Google
                  </motion.button>
                  <motion.button
                    type="button"
                    className="social-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiGithub />
                    GitHub
                  </motion.button>
                  <motion.button
                    type="button"
                    className="social-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiLinkedin />
                    LinkedIn
                  </motion.button>
                </div>
              </form>

              <div className="create-account">
                <p>
                  Don't have an account?{' '}
                  <Link to="/startupregister" className="register-link">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default StartupLogin;