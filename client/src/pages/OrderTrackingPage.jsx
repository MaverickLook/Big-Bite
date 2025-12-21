import React, { useState } from 'react';

const OrderTrackingPage = () => {
  // TODO: Get order data from backend/context
  const [order] = useState({
    orderId: '#12345',
    status: 'out_for_delivery', // pending, confirmed, preparing, out_for_delivery, delivered
    items: [
      { id: 1, name: 'Margherita Pizza', quantity: 1, price: 12.99 },
      { id: 2, name: 'Caesar Salad', quantity: 2, price: 8.99 },
    ],
    totalAmount: 30.97,
    estimatedDelivery: '30-45 minutes',
    orderTime: '2:15 PM',
    deliveryAddress: '123 Main Street, Apt 4B',
    deliveryPersonName: 'John Driver',
    deliveryPersonPhone: '+1 (555) 123-4567',
  });

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', time: '2:15 PM' },
    { key: 'confirmed', label: 'Confirmed', time: '2:18 PM' },
    { key: 'preparing', label: 'Preparing', time: '2:25 PM' },
    { key: 'out_for_delivery', label: 'Out for Delivery', time: '--' },
    { key: 'delivered', label: 'Delivered', time: '--' }
  ];

  const getStepStatus = (stepKey) => {
    const statusOrder = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(stepKey);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="page-container">
      <h1>📍 Track Your Delivery</h1>

      {/* Order Header */}
      <div className="order-header">
        <div className="order-info">
          <p className="order-id">Order ID: <strong>{order.orderId}</strong></p>
          <p className="order-time">Ordered at: <strong>{order.orderTime}</strong></p>
          <p className="delivery-address">📍 Delivery to: <strong>{order.deliveryAddress}</strong></p>
        </div>
      </div>

      {/* Order Status Timeline */}
      <div className="status-timeline">
        <h2>Delivery Status</h2>
        <div className="timeline">
          {statusSteps.map((step, index) => (
            <div key={step.key} className={`timeline-step ${getStepStatus(step.key)}`}>
              <div className="timeline-marker">
                {getStepStatus(step.key) === 'completed' && '✓'}
                {getStepStatus(step.key) === 'current' && '●'}
              </div>
              <div className="timeline-content">
                <p className="step-label">{step.label}</p>
                <p className="step-time">{step.time}</p>
              </div>
              {index < statusSteps.length - 1 && <div className="timeline-connector"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Estimated Delivery */}
      {order.status === 'out_for_delivery' && (
      <div className="estimated-delivery">
        <h2>Estimated Delivery Time</h2>
        <p className="delivery-time">⏱️ {order.estimatedDelivery}</p>
      </div>
      )}

      {/* Delivery Partner Info */}
      {order.status === 'out_for_delivery' && (
        <div className="delivery-partner-info">
          <h2>Your Delivery Partner</h2>
          <div className="partner-card">
            <p className="partner-name">👤 {order.deliveryPersonName}</p>
            <p className="partner-phone">📱 <a href={`tel:${order.deliveryPersonPhone}`}>{order.deliveryPersonPhone}</a></p>
            <p className="partner-note">Your food is on its way! Driver will arrive shortly.</p>
          </div>
        </div>
      )}

      {/* Order Items Summary */}
      <div className="order-items">
        <h2>Order Items</h2>
        <div className="items-list">
          {order.items.map((item) => (
            <div key={item.id} className="order-item">
              <div className="item-details">
                <p className="item-name">{item.name}</p>
                <p className="item-quantity">Qty: {item.quantity}</p>
              </div>
              <p className="item-price">NT$ {item.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="order-total">
          <p>Total Amount: <strong>NT$ {order.totalAmount.toFixed(2)}</strong></p>
        </div>
      </div>

      {/* Contact Support */}
      <div className="contact-support">
        <button className="btn btn-secondary">📞 Contact Restaurant</button>
        <button className="btn btn-secondary">🚗 Contact Driver</button>
        <button className="btn btn-secondary">❓ Help & Support</button>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
