import React from 'react';
import './OrderStatusBadge.css';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: '#f57c00',
    bgColor: '#fff8e1'
  },
  preparing: {
    label: 'Preparing',
    color: '#1976d2',
    bgColor: '#e3f2fd'
  },
  delivering: {
    label: 'Delivering',
    color: '#ff6b35',
    bgColor: '#fff5f2'
  },
  completed: {
    label: 'Completed',
    color: '#2e7d32',
    bgColor: '#e8f5e9'
  },
  cancelled: {
    label: 'Cancelled',
    color: '#d32f2f',
    bgColor: '#ffebee'
  }
};

const OrderStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  
  return (
    <span 
      className="order-status-badge"
      style={{ 
        backgroundColor: config.bgColor, 
        color: config.color 
      }}
    >
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;

