import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import OrderStatusBadge from '../components/OrderStatusBadge';
import './AccountPage.css';

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  const authMethodLabel = useMemo(() => {
    const provider = user?.authProvider || (user?.googleId ? 'google' : 'local');
    return provider === 'google' ? 'Google OAuth' : 'Email/Password';
  }, [user]);

  useEffect(() => {
    refreshProfile?.();
  }, [refreshProfile]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      try {
        setIsLoadingOrders(true);
        setOrdersError(null);
        const response = await api.get(`/orders/user/${user.id}`);
        setOrders(response.data || []);
      } catch (err) {
        console.error('Failed to load order history:', err);
        setOrdersError('Failed to load order history.');
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  return (
    <div className="page-container account-page">
      <h1>👤 My Account</h1>

      <div className="account-container">
        <div className="account-card">
          <div className="account-card-header">
            <h2>Profile Information</h2>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/account/edit')}
            >
              Edit Profile
            </button>
          </div>

          <div className="profile-grid">
            <div className="profile-row">
              <span className="profile-label">Name</span>
              <span className="profile-value">{user?.name || '—'}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Email</span>
              <span className="profile-value">{user?.email || '—'}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Auth Method</span>
              <span className="profile-value">{authMethodLabel}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Phone</span>
              <span className="profile-value">{user?.phoneNumber || '—'}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Delivery Address</span>
              <span className="profile-value">{user?.deliveryAddress || '—'}</span>
            </div>
          </div>
        </div>

        <div className="account-card">
          <div className="account-card-header">
            <h2>Order History</h2>
          </div>

          {ordersError && <div className="account-error">{ordersError}</div>}

          {isLoadingOrders ? (
            <div className="account-empty">Loading your orders…</div>
          ) : orders.length === 0 ? (
            <div className="account-empty">You have not placed any orders yet.</div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-row">
                  <div className="order-main">
                    <div className="order-id">#{order._id.toString().slice(-8).toUpperCase()}</div>
                    <div className="order-meta">
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                      <span className="dot">•</span>
                      <span>NT$ {Number(order.totalPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="order-right">
                    <OrderStatusBadge status={order.status} />
                    <Link className="btn btn-primary btn-small" to={`/order/${order._id}`}>
                      View Order Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;

