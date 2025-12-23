import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import OrderStatusBadge from '../components/OrderStatusBadge';
import OrderProgressTracker from '../components/OrderProgressTracker';
import './OrderStatusPage.css';

const OrderStatusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);
      
      //fetch order by ID
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (err) {
      console.error('Error fetching order:', err);
      
      // If order not found, try to get from user orders
      try {
        const userId = JSON.parse(localStorage.getItem('user'))?.id;
        if (userId) {
          const userOrdersResponse = await api.get(`/orders/user/${userId}`);
          const foundOrder = userOrdersResponse.data.find(o => o._id === orderId);
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            setError('Order not found');
          }
        } else {
          setError('Order not found');
        }
      } catch (err2) {
        setError('Order not found');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => fetchOrder({ silent: true }), 10000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const getEstimatedDeliveryTime = () => {
    if (!order) return '30-45 minutes';
    
    const status = order.status;
    if (status === 'completed') return 'Delivered';
    if (status === 'cancelled') return 'N/A';
    if (status === 'pending') return '30-45 minutes';
    if (status === 'preparing') return '20-30 minutes';
    if (status === 'delivering') return '5-15 minutes';
    return '30-45 minutes';
  };

  if (isLoading) {
    return (
      <div className="page-container order-status-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-container order-status-page">
        <div className="error-container">
          <h2>Order Not Found</h2>
          <p>{error || 'The order you are looking for does not exist.'}</p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const orderIdDisplay = `#${order._id.toString().slice(-8).toUpperCase()}`;

  return (
    <div className="page-container order-status-page">
      <div className="order-status-header">
        <h1>📦 Order Status</h1>
        <div className="order-id-large">Order ID: {orderIdDisplay}</div>
      </div>

      {/* Progress Tracker */}
      <div className="order-progress-section">
        <OrderProgressTracker status={order.status} />
      </div>

      {/* Order Details Card */}
      <div className="order-details-card">
        <div className="order-status-badge-section">
          <h3>Current Status</h3>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="order-info-grid">
          <div className="info-item">
            <span className="info-label">Order ID:</span>
            <span className="info-value">{orderIdDisplay}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Order Time:</span>
            <span className="info-value">
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Estimated Delivery:</span>
            <span className="info-value">{getEstimatedDeliveryTime()}</span>
          </div>
          {order.status === 'completed' && (
            <div className="info-item">
              <span className="info-label">Completed At:</span>
              <span className="info-value">
                {new Date(order.updatedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Address Section */}
      <div className="order-details-card">
        <h3>Delivery Address</h3>
        <div className="delivery-address-content">
          {order.deliveryAddress ? (
            <>
              {order.recipientName && (
                <div className="address-field">
                  <strong>{order.recipientName}</strong>
                </div>
              )}
              {(order.phoneNumber || order.phone) && (
                <div className="address-field">{order.phoneNumber || order.phone}</div>
              )}
              <div className="address-field">{order.deliveryAddress}</div>
            </>
          ) : (
            <div className="address-warning">⚠️ Delivery address not provided</div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="order-items-card">
        <h3>Order Items</h3>
        <div className="items-list">
          {order.items && order.items.map((item, index) => (
            <div key={index} className="order-item-row">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">Qty: {item.quantity}</span>
              </div>
              <span className="item-price">
                NT$ {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="order-total">
          <span className="total-label">Total:</span>
          <span className="total-value">NT$ {order.totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="order-actions">
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          🏠 Back to Home
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/menu')}
        >
          🍽️ Order More
        </button>
      </div>
    </div>
  );
};

export default OrderStatusPage;

