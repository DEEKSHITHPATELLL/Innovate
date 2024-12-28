import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiGithub, FiLinkedin } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './Peopleregister.css';

const Peopleregister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    if (!password) return '';
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;

    const strength = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (length < 8) return 'weak';
    if (strength <= 2) return 'weak';
    if (strength === 3) return 'medium';
    return 'strong';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    setError('');
    setUserExists(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordStrength === 'weak') {
      setError('Please choose a stronger password');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/people/register', formData, {
        withCredentials: true,
      });

      setSuccess('Registration successful! Redirecting...');
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

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="register-page">
      <motion.div 
        className="register-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="register-content">
          <motion.div 
            className="register-left"
            variants={itemVariants}
          >
            <h1>Welcome to Our Community</h1>
            <p className="subtitle">Join thousands of people connecting with innovative startups and investors</p>
            
            <motion.div className="features" variants={containerVariants}>
              <motion.div className="feature-item" variants={featureVariants}>
                <div className="feature-icon">🌟</div>
                <div className="feature-text">
                  <h3>Discover Opportunities</h3>
                  <p>Connect with innovative startups and explore investment opportunities</p>
                </div>
              </motion.div>
              
              <motion.div className="feature-item" variants={featureVariants}>
                <div className="feature-icon">💼</div>
                <div className="feature-text">
                  <h3>Professional Network</h3>
                  <p>Build your professional network with like-minded individuals</p>
                </div>
              </motion.div>
              
              <motion.div className="feature-item" variants={featureVariants}>
                <div className="feature-icon">🚀</div>
                <div className="feature-text">
                  <h3>Grow Together</h3>
                  <p>Be part of a community that grows and succeeds together</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="register-right"
            variants={itemVariants}
          >
            <div className="form-container">
              <h2>Create Account</h2>
              
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
                {userExists && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="user-exists-message"
                  >
                    This email is already registered.
                    <Link to="/peoplelogin" className="login-link">Sign in instead</Link>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="register-form">
                <div className="input-group">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

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

                {passwordStrength && (
                  <div className="password-strength">
                    <div className="strength-meter">
                      <div className={`strength-meter-fill strength-${passwordStrength}`}></div>
                    </div>
                    <small>
                      Password strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                    </small>
                  </div>
                )}

                <div className="input-group">
                  <FiLock className="input-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <div
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </div>
                </div>

                <motion.button 
                  type="submit" 
                  className="register-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
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

              <div className="already-registered">
                <p>
                  Already have an account?{' '}
                  <Link to="/peoplelogin" className="login-link">
                    Sign in
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

export default Peopleregister;