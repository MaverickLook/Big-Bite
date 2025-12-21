import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      // If we get a response (success or not), show success message
      setIsSuccess(true);
      setEmail('');
      setError('');
    } catch (err) {
      console.error('Forgot password error:', err);
      // Better error handling
      if (err.response && err.response.status >= 400 && err.response.status < 500) {
        // Client error (4xx) - show the error message
        setError(err.response.data?.message || 'Please check your email address.');
      } else if (err.request) {
        // Request made but no response received
        setError('Unable to connect to server. Please check your connection and try again.');
      } else {
        // Network error or other issue - still show success to match backend behavior
        setIsSuccess(true);
        setEmail('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <img src="/big-bite-logo.png" alt="Big-Bite" className="auth-logo" />
          <h2>Forgot Password</h2>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        {isSuccess ? (
          <div className="success-message">
            If an account with that email exists, we've sent a reset link.
          </div>
        ) : (
          <>
            <p style={{ 
              textAlign: 'center', 
              color: '#666', 
              marginBottom: '1.5rem',
              fontSize: '0.95rem'
            }}>
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                  disabled={isLoading}
                  className={error && error.includes('email') ? 'input-error' : ''}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary auth-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <div className="auth-footer">
          <p>
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

