import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './OrderStatusBanner.css';

const OrderStatusBanner = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [guestOrderId, setGuestOrderId] = useState('');

  const fetchCurrentOrder = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoading(true);

      const userData = user || JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData?.id || userData?._id;

      if (!userId) {
        if (!silent) setIsLoading(false);
        return;
      }

      const response = await api.get(`/orders/user/${userId}`);
      const orders = response.data || [];

      // Find the most recent active order
      const activeOrder = orders
        .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      setCurrentOrder(activeOrder || null);
    } catch (error) {
      if (!silent) {
        console.error('Error fetching current order:', error);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem('orderBannerDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    if (isAuthenticated && user?.id) {
      fetchCurrentOrder();
      // Poll for updates every 10 seconds
      const interval = setInterval(() => {
        fetchCurrentOrder({ silent: true });
      }, 10000);
      return () => clearInterval(interval);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, fetchCurrentOrder]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('orderBannerDismissed', 'true');
  };

  const handleTrackOrder = () => {
    if (currentOrder) {
      navigate(`/order/${currentOrder._id}`);
    }
  };

  const handleGuestTrackOrder = async () => {
    if (guestOrderId.trim()) {
      try {
        // Validate order exists
        await api.get(`/orders/${guestOrderId.trim()}`);
        navigate(`/order/${guestOrderId.trim()}`);
      } catch (error) {
        alert('Order not found. Please check your order ID.');
      }
    }
  };

  const getEstimatedDelivery = (order) => {
    if (!order) return null;
    
    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - createdAt) / 1000 / 60);

    switch (order.status) {
      case 'pending':
        return '30-40 minutes';
      case 'preparing':
        return '20-30 minutes';
      case 'delivering':
        return '10-15 minutes';
      default:
        return 'Soon';
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '📋',
      preparing: '👨‍🍳',
      delivering: '🚚',
      completed: '✓',
      cancelled: '❌'
    };
    return icons[status] || '📦';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Order Received',
      preparing: 'Preparing Your Food',
      delivering: 'Out for Delivery',
      completed: 'Delivered',
      cancelled: 'Cancelled'
    };
    return texts[status] || 'Processing';
  };

  // Don't show if dismissed or loading without data
  if (isDismissed || (isLoading && !currentOrder)) {
    return null;
  }

  // Guest user - show prompt
  if (!isAuthenticated) {
    return (
      <div className="order-banner guest-banner">
        <div className="order-banner-container">
          <div className="order-banner-content">
            <div className="order-banner-icon">📦</div>
            <div className="order-banner-info">
              <div className="order-banner-title">Track Your Order</div>
              <div className="order-banner-subtitle">
                {showGuestPrompt ? 'Enter your order ID to track' : 'Have an existing order?'}
              </div>
            </div>
          </div>
          
          {showGuestPrompt ? (
            <div className="guest-track-form">
              <input
                type="text"
                className="guest-order-input"
                placeholder="Enter Order ID"
                value={guestOrderId}
                onChange={(e) => setGuestOrderId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGuestTrackOrder()}
              />
              <button 
                className="btn-banner-action" 
                onClick={handleGuestTrackOrder}
              >
                Track
              </button>
              <button 
                className="btn-banner-secondary" 
                onClick={() => setShowGuestPrompt(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="order-banner-actions">
              <button 
                className="btn-banner-action" 
                onClick={() => setShowGuestPrompt(true)}
              >
                Track Order
              </button>
              <button 
                className="btn-banner-secondary" 
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
              <button 
                className="btn-banner-dismiss" 
                onClick={handleDismiss}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // No active order for authenticated user
  if (!currentOrder) {
    return null;
  }

  // Show active order banner
  const orderIdDisplay = `#${currentOrder._id.toString().slice(-8).toUpperCase()}`;
  const estimatedDelivery = getEstimatedDelivery(currentOrder);

  return (
    <div className="order-banner active-order-banner">
      <div className="order-banner-container">
        <div className="order-banner-content">
          <div className="order-banner-icon pulse">
            {getStatusIcon(currentOrder.status)}
          </div>
          <div className="order-banner-info">
            <div className="order-banner-title">
              Order {orderIdDisplay}
            </div>
            <div className="order-banner-status">
              <span className="status-text">{getStatusText(currentOrder.status)}</span>
              {estimatedDelivery && (
                <span className="delivery-time">• Est. {estimatedDelivery}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="order-banner-actions">
          <button 
            className="btn-banner-track" 
            onClick={handleTrackOrder}
          >
            Track Order →
          </button>
          <button 
            className="btn-banner-dismiss" 
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusBanner;
