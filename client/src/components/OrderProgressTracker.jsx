import React from 'react';
import './OrderProgressTracker.css';

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'delivering', label: 'Delivering' },
  { key: 'completed', label: 'Completed' }
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
        return (
          <React.Fragment key={step.key}>
            <div className={`progress-step ${stepStatus}`}>
              <div className="step-marker">
                {stepStatus === 'completed' ? '✓' : stepStatus === 'current' ? '●' : '○'}
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

