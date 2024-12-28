import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiMapPin, FiGrid, FiUpload, FiGithub, FiLinkedin } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './StartupRegister.css';

const locations = [
  "Basaralu",
  "Belakavadi",
  "Dudda",
  "Guttalu",
  "Halagur",
  "Hosahalli",
  "Hulivana",
  "Keregodu",
  "Kikkeri",
  "Kirugavalu",
  "Konnanur",
  "Kyathaghatta",
  "Maddur",
  "Malavalli",
  "Mandagere",
  "Melkote",
  "Nagamangala",
  "Pandavapura",
  "Shivalli",
  "Srirangapatna"
];

const businessDomains = [
  "Gym",
  "Pharmacy",
  "Coffee Shop",
  "Electronics Shop",
  "Restaurant",
  "Grocery Store"
];

const StartupRegister = () => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    location: '',
    domain: '',
    uploadedFile: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
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
    const { name, value, files } = e.target;
    if (name === 'uploadedFile' && files.length > 0) {
      setFormData({ ...formData, [name]: files[0] });
      setFileName(files[0].name);
    } else {
      setFormData({ ...formData, [name]: value });
      if (name === 'password') {
        setPasswordStrength(calculatePasswordStrength(value));
      }
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

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'confirmPassword') {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post('http://localhost:8000/api/startup/register', data, {
        withCredentials: true,
      });

      setSuccess('Registration successful! Redirecting...');
      setError('');
      setUserExists(false);

      const registeredStartups = JSON.parse(localStorage.getItem('startups')) || [];
      registeredStartups.push({
        id: response.data.id,
        ...formData,
        uploadedFile: response.data.uploadedFileUrl,
      });
      localStorage.setItem('startups', JSON.stringify(registeredStartups));

      setTimeout(() => {
        navigate('/startuphome');
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
            <h1>Launch Your Startup</h1>
            <p className="subtitle">Join our platform to connect with investors and grow your business</p>
            
            <motion.div className="features">
              <motion.div className="feature-item" variants={itemVariants}>
                <div className="feature-icon">💡</div>
                <div className="feature-text">
                  <h3>Showcase Your Innovation</h3>
                  <p>Present your unique ideas to potential investors</p>
                </div>
              </motion.div>
              
              <motion.div className="feature-item" variants={itemVariants}>
                <div className="feature-icon">🤝</div>
                <div className="feature-text">
                  <h3>Connect with Investors</h3>
                  <p>Network with leading investors in your domain</p>
                </div>
              </motion.div>
              
              <motion.div className="feature-item" variants={itemVariants}>
                <div className="feature-icon">📈</div>
                <div className="feature-text">
                  <h3>Scale Your Business</h3>
                  <p>Access resources to grow your startup</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="register-right"
            variants={itemVariants}
          >
            <div className="form-container">
              <h2>Create Startup Account</h2>
              
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
                    <Link to="/startuplogin" className="login-link">Sign in instead</Link>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="register-form">
                <div className="input-group">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Startuper Name"
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

                <div className="input-group">
                  <FiPhone className="input-icon" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <FiMapPin className="input-icon" />
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Location</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <FiGrid className="input-icon" />
                  <select
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Business Domain</option>
                    {businessDomains.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="file-input-group">
                  <input
                    type="file"
                    name="uploadedFile"
                    ref={fileInputRef}
                    onChange={handleChange}
                    required
                    style={{ display: 'none' }}
                  />
                  <motion.button
                    type="button"
                    className="file-upload-button"
                    onClick={() => fileInputRef.current.click()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiUpload />
                    {fileName || 'Upload Business Plan'}
                  </motion.button>
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
                  <Link to="/startuplogin" className="login-link">
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

export default StartupRegister;
