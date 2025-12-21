import React from 'react';
import './RevenueCard.css';

const RevenueCard = ({ icon, value, label, variant = 'default' }) => {
  return (
    <div className={`revenue-card revenue-card-${variant}`}>
      <div className="revenue-icon">{icon}</div>
      <div className="revenue-content">
        <div className="revenue-value">{value}</div>
        <div className="revenue-label">{label}</div>
      </div>
    </div>
  );
};

export default RevenueCard;

