import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StartupRegister.css';
const StartupRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    location: '',
    domain: '',
    uploadedFile: null, // This should hold the file
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userExists, setUserExists] = useState(false); // To handle existing user error
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'uploadedFile') {
      setFormData({ ...formData, [name]: files[0] }); // For file upload
    } else {
      setFormData({ ...formData, [name]: value }); // For text fields
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('phoneNumber', formData.phoneNumber);
    data.append('location', formData.location);
    data.append('domain', formData.domain);
    data.append('uploadedFile', formData.uploadedFile); // Append the file

    try {
      const response = await axios.post('http://localhost:8000/api/startup/register', data, {
        withCredentials: true, // Send cookies with the request
      });

      setSuccess(response.data.message); // Set success message
      setError(''); // Clear error state
      setUserExists(false); // Reset userExists state

      // Save the registered startup information to localStorage
      const registeredStartups = JSON.parse(localStorage.getItem('startups')) || [];
      registeredStartups.push({
        id: response.data.id, // Use the unique ID from the backend
        ...formData,
        uploadedFile: response.data.uploadedFileUrl, // Add the file URL from the backend
      });
      localStorage.setItem('startups', JSON.stringify(registeredStartups));

      // Redirect after successful registration
      setTimeout(() => {
        navigate('/startuphome');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error); // Log the error for debugging
      setError(error.response?.data?.error || 'An error occurred');
      setSuccess('');

      if (error.response?.data?.error === 'User already exists') {
        setUserExists(true); // Show error if user already exists
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      {userExists && (
        <div className="user-exists-message">
          This email is already registered.
        </div>
      )}
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
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
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="domain"
          placeholder="Domain"
          value={formData.domain}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="uploadedFile"
          onChange={handleChange}
          required
        />
        <button type="submit" className="register-button">
          Register
        </button>
      </form>
      <div className="login-link-container">
        <p>Already registered?</p>
        <a href="/Startuplogin" className="login-link">
          Go to Login
        </a>
      </div>
    </div>
  );
};

export default StartupRegister;
