import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StartupLogin.css'; // Import the CSS file

const StartupLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Update the form data
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await axios.post('http://localhost:8000/api/startup/login', data, {
        headers: { 'Content-Type': 'application/json' }, // Set Content-Type to JSON
        withCredentials: true, // Send cookies with the request
      });

      setSuccess(response.data.message); // Set success message
      setError(''); // Clear error state

      // Redirect to startup home on successful login
      setTimeout(() => {
        navigate('/startuphome');
      }, 2000);
    } catch (error) {
      console.error('Login error:', error); // Log the error for debugging
      setError(error.response?.data?.error || 'Invalid email or password');
      setSuccess('');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="login-button">Login</button>
      </form>
      <div className="register-redirect-container">
        <p>Not registered yet?</p>
        <a href="/startupregister" className="register-link">Register here</a>
      </div>
    </div>
  );
};

export default StartupLogin;