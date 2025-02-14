import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PeopleLogin.css'; 

const PeopleLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send only email and password to the backend for login
      const response = await axios.post('http://localhost:8000/api/people/login', formData, {
        withCredentials: true, 
      });

      setSuccess(response.data.message);  // Set success message
      setError('');  // Clear error

      // After successful login, navigate to the dashboard or another page
      setTimeout(() => {
        navigate('/peoplehome'); // Redirect to the dashboard page
      }, 2000);
    } catch (error) {
      console.error('Login error:', error); // Log full error to debug
      setError(error.response?.data?.error || 'An error occurred'); // Display error message
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
      <div className="back-to-register">
        <p>Don't have an account? <a href="/peopleregister" className="register-link">Register here</a>.</p>
      </div>
    </div>
  );
};

export default PeopleLogin;