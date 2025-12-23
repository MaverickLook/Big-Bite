import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EditProfilePage.css';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, refreshProfile, isLoading, error, clearError } = useAuth();

  const isGoogle = useMemo(() => (user?.authProvider === 'google'), [user]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    deliveryAddress: '',
  });
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    refreshProfile?.();
  }, [refreshProfile]);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      deliveryAddress: user?.deliveryAddress || '',
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError?.();
    setSuccessMessage(null);

    const result = await updateProfile({
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      deliveryAddress: formData.deliveryAddress,
    });

    if (result.success) {
      setSuccessMessage('Profile updated successfully.');
      setTimeout(() => navigate('/account'), 600);
    }
  };

  return (
    <div className="page-container edit-profile-page">
      <div className="edit-profile-header">
        <h1 style={{ textAlign: 'center', width: '100%' }}>✏️ Edit Profile</h1>
      </div>

      <div className="edit-profile-card">
        {error && <div className="edit-profile-error">{error}</div>}
        {successMessage && <div className="edit-profile-success">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled
            />
            {isGoogle && (
              <small className="hint">Email cannot be edited for Google OAuth accounts.</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number (optional)</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g. +886 912 345 678"
            />
          </div>

          <div className="form-group">
            <label htmlFor="deliveryAddress">Delivery Address (optional)</label>
            <textarea
              id="deliveryAddress"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
              placeholder="Street, city, postal code (optional)"
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/account')}
            disabled={isLoading}
            style={{ marginBottom: '0.25rem' }}
          >
            Back
          </button>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;


