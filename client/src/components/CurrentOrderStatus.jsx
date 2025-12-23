import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import OrderStatusBadge from './OrderStatusBadge';
import './CurrentOrderStatus.css';

const CurrentOrderStatus = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchCurrentOrder();
      const interval = setInterval(fetchCurrentOrder, 15000);//update every 15sec
      return () => clearInterval(interval);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchCurrentOrder = async () => {
    try {
      setIsLoading(true);
      const userData = user || JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData?.id || userData?._id;
      
      if (!userId) {
        setIsLoading(false);
        return;
      }

      const response = await api.get(`/orders/user/${userId}`);
      const orders = response.data || [];
      
      const activeOrder = orders
        .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      
      setCurrentOrder(activeOrder || null);
    } catch (error) {
      console.error('Error fetching current order:', error);
      setCurrentOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || isLoading) {
    return null;
  }

  if (!currentOrder) {
    return null;
  }

  const orderIdDisplay = `#${currentOrder._id.toString().slice(-8).toUpperCase()}`;
  const statusMessage = getStatusMessage(currentOrder.status);

  return (
    <div className="current-order-status">
      <div className="current-order-card">
        <div className="order-card-header">
          <h3>📦 Current Order</h3>
          <OrderStatusBadge status={currentOrder.status} />
        </div>
        <div className="order-card-body">
          <div className="order-card-info">
            <span className="order-card-id">{orderIdDisplay}</span>
            <span className="order-card-message">{statusMessage}</span>
          </div>
          <Link 
            to={`/order/${currentOrder._id}`}
            className="btn-view-order"
          >
            View Order Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

const getStatusMessage = (status) => {
  const messages = {
    pending: 'Your order has been placed',
    preparing: 'Your food is being prepared',
    delivering: 'Your order is out for delivery',
    completed: 'Your order has been completed',
    cancelled: 'Your order has been cancelled'
  };
  return messages[status] || 'Processing your order...';
};

export default CurrentOrderStatus;

