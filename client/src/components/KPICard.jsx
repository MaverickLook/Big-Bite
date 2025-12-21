import React from 'react';
import './KPICard.css';

const KPICard = ({ icon, value, label, variant = 'default' }) => {
  return (
    <div className={`kpi-card kpi-card-${variant}`}>
      {icon && <div className="kpi-icon">{icon}</div>}
      <div className="kpi-content">
        <div className="kpi-value">{value}</div>
        <div className="kpi-label">{label}</div>
      </div>
    </div>
  );
};

export default KPICard;

