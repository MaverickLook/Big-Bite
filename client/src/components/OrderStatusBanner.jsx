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
    const collapsed = sessionStorage.getItem('orderBannerCollapsed');
    if (collapsed === 'true') {
      setIsCollapsed(true);
    }

    if (isAuthenticated && user?.id) {
      fetchCurrentOrder();
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

  if (isLoading && activeOrders.length === 0) {
    return null;
  }

  if (activeOrders.length === 0) {
    return null;
  }

  const topOrder = activeOrders[0];
  const orderIdDisplay = `#${topOrder._id.toString().slice(-8).toUpperCase()}`;
  const estimatedDelivery = getEstimatedDelivery(topOrder);

  if (isCollapsed) {
    return (
      <div 
        className="order-banner active-order-banner collapsed" 
        onClick={handleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleExpand()}
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
        
        <button 
          className="btn-banner-collapse bottom-center" 
          onClick={handleCollapse}
          aria-label="Collapse"
          title="Minimize banner"
        >
          ▲
        </button>
      </div>
    </div>
  );
};

export default OrderStatusBanner;
