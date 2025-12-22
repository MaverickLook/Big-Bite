import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './OrderStatusBanner.css';

const OrderStatusBanner = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeOrders, setActiveOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
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

      // Collect all active orders and sort newest first
      const allActive = orders
        .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setActiveOrders(allActive);
    } catch (error) {
      if (!silent) {
        console.error('Error fetching current order:', error);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Check if banner was collapsed in this session
    const collapsed = sessionStorage.getItem('orderBannerCollapsed');
    if (collapsed === 'true') {
      setIsCollapsed(true);
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

  const handleCollapse = () => {
    setIsCollapsed(true);
    sessionStorage.setItem('orderBannerCollapsed', 'true');
  };

  const handleExpand = () => {
    setIsCollapsed(false);
    sessionStorage.setItem('orderBannerCollapsed', 'false');
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

  // Don't show if loading without data
  if (isLoading && activeOrders.length === 0) {
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
                onClick={() => setShowGuestPrompt(false)}
                aria-label="Close"
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
  if (activeOrders.length === 0) {
    return null;
  }

  // Show active order banner
  const topOrder = activeOrders[0];
  const orderIdDisplay = `#${topOrder._id.toString().slice(-8).toUpperCase()}`;
  const estimatedDelivery = getEstimatedDelivery(topOrder);

  // Collapsed state - minimal banner
  if (isCollapsed) {
    return (
      <div 
        className="order-banner active-order-banner collapsed" 
        onClick={handleExpand}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleExpand()}
        aria-label="Expand order status"
      >
        <div className="order-banner-container-collapsed">
          <div className="order-banner-icon-small">
            {getStatusIcon(topOrder.status)}
          </div>
          <div className="order-banner-info-collapsed">
            <span className="order-id-collapsed">{orderIdDisplay}</span>
            <span className="status-dot">•</span>
            <span className="status-text-collapsed">{getStatusText(topOrder.status)}</span>
          </div>
          <div className="expand-icon">▼</div>
        </div>
      </div>
    );
  }

  // Expanded state - full banner
  return (
    <div className="order-banner active-order-banner expanded">
      <div className="order-banner-container">
        <div className="order-banner-content">
          <div className="order-banner-icon pulse">
            {getStatusIcon(topOrder.status)}
          </div>
          <div className="order-banner-info">
            <div className="order-banner-title">
              Active Orders
            </div>
            <div className="order-banner-status">
              <span className="status-text">Newest on top</span>
            </div>
          </div>
        </div>
        
        {/* Stacked orders list */}
        <div className="order-list">
          {activeOrders.map((order) => {
            const idDisplay = `#${order._id.toString().slice(-8).toUpperCase()}`;
            const est = getEstimatedDelivery(order);
            return (
              <div className="order-item" key={order._id}>
                <div className="order-item-left">
                  <div className="order-item-icon">{getStatusIcon(order.status)}</div>
                  <div className="order-item-info">
                    <div className="order-item-id">{idDisplay}</div>
                    <div className="order-item-status">
                      <span className="order-item-status-text">{getStatusText(order.status)}</span>
                      {est && <span className="order-item-delivery">• Est. {est}</span>}
                    </div>
                  </div>
                </div>
                <div className="order-item-actions">
                  <button
                    className="btn-item-track"
                    onClick={() => navigate(`/order/${order._id}`)}
                  >
                    Track →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Bottom-center collapse toggle */}
        <button 
          className="btn-banner-collapse bottom-center" 
          onClick={handleCollapse}
          aria-label="Collapse"
          title="Minimize banner"
        >
          Minimize
        </button>
      </div>
    </div>
  );
};

export default OrderStatusBanner;
