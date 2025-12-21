import React from 'react';
import './StatusToggle.css';

// Status flow: Pending → Preparing → Delivering → Completed
const STATUS_ORDER = ['pending', 'preparing', 'delivering', 'completed'];
const STATUS_LABELS = {
  pending: 'Pending',
  preparing: 'Preparing',
  delivering: 'Delivering',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

const STATUS_COLORS = {
  pending: '#f57c00',
  preparing: '#1976d2',
  delivering: '#ff6b35',
  completed: '#2e7d32',
  cancelled: '#d32f2f'
};

const StatusToggle = ({ status, onStatusChange, orderId }) => {
  const handleToggle = () => {
    if (status === 'cancelled' || status === 'completed') {
      return; // Can't toggle cancelled or completed orders
    }

    // Map current status to next in sequence
    let currentIndex = STATUS_ORDER.indexOf(status);
    
    // Default to pending if unknown
    if (currentIndex === -1) {
      currentIndex = 0;
    }

    // Only advance forward, don't cycle
    const nextIndex = currentIndex + 1;
    if (nextIndex >= STATUS_ORDER.length) {
      return; // Already at the end
    }
    
    const nextStatus = STATUS_ORDER[nextIndex];
    
    if (onStatusChange) {
      onStatusChange(orderId, nextStatus);
    }
  };

  const getStatusBadge = () => {
    const color = STATUS_COLORS[status] || '#666';
    return (
      <span 
        className="status-badge" 
        style={{ backgroundColor: color + '20', color: color }}
      >
        {STATUS_LABELS[status] || status}
      </span>
    );
  };

  if (status === 'cancelled' || status === 'completed') {
    return getStatusBadge();
  }

  return (
    <div className="status-toggle-container">
      {getStatusBadge()}
      <button 
        className="status-toggle-btn"
        onClick={handleToggle}
        title={`Click to change status`}
      >
        ↻
      </button>
    </div>
  );
};

export default StatusToggle;

