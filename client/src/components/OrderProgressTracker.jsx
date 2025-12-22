import React from 'react';
import './OrderProgressTracker.css';

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📋' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'delivering', label: 'Delivering', icon: '🚚' },
  { key: 'completed', label: 'Completed', icon: '✓' }
];

const STATUS_ORDER = ['pending', 'preparing', 'delivering', 'completed'];

const OrderProgressTracker = ({ status }) => {
  const getStepStatus = (stepKey) => {
    if (status === 'cancelled') return 'cancelled';
    
    const currentIndex = STATUS_ORDER.indexOf(status);
    const stepIndex = STATUS_ORDER.indexOf(stepKey);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStepIcon = (step, stepStatus) => {
    if (stepStatus === 'completed') return '✓';
    if (stepStatus === 'current') return step.icon;
    return step.icon;
  };

  if (status === 'cancelled') {
    return (
      <div className="order-progress">
        <div className="progress-step cancelled">
          <div className="step-marker">✗</div>
          <div className="step-label">Order Cancelled</div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-progress">
      {ORDER_STEPS.map((step, index) => {
        const stepStatus = getStepStatus(step.key);
        const icon = getStepIcon(step, stepStatus);
        return (
          <React.Fragment key={step.key}>
            <div className={`progress-step ${stepStatus}`}>
              <div className="step-marker">
                {icon}
              </div>
              <div className="step-label">{step.label}</div>
            </div>
            {index < ORDER_STEPS.length - 1 && (
              <div className={`progress-line ${stepStatus === 'completed' ? 'completed' : ''}`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default OrderProgressTracker;

