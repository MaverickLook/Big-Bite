import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusToggle from '../components/StatusToggle';
import OrderStatusBadge from '../components/OrderStatusBadge';
import './OrdersManagement.css';

const OrdersManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/orders');
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
      // Use mock data if API fails
      setOrders([
        {
          _id: '1',
          orderId: '#ORD001',
          user: { name: 'John Doe', email: 'john@example.com' },
          items: [{ name: 'Margherita Pizza', quantity: 2, price: 12.99 }],
          totalPrice: 25.98,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      const updated = response.data;
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, ...updated } : order
      ));

      // If viewing details, update that too
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, ...updated }));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to update order status';
      alert(msg);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await api.put(`/orders/${orderId}/status`, { status: 'cancelled' });
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const getItemsSummary = (items) => {
    if (!items || items.length === 0) return 'No items';
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    return `${totalItems} item${totalItems > 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <div className="orders-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-management">
      <div className="orders-header">
        <h1>📦 Orders Management</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="close-btn" onClick={() => setShowOrderDetails(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="order-detail-info">
                <div className="detail-row">
                  <span className="detail-label">Order ID:</span>
                  <span className="detail-value">#{selectedOrder._id.toString().slice(-8).toUpperCase()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Customer:</span>
                  <span className="detail-value">{selectedOrder.user?.name || 'Unknown'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedOrder.user?.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedOrder.phoneNumber || selectedOrder.phone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
                <div className="detail-row">
                  <span className="detail-label">Order Time:</span>
                  <span className="detail-value">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="delivery-address-section">
                <h3>Delivery Address</h3>
                <div className="delivery-address-content">
                  {selectedOrder.deliveryAddress ? (
                    <>
                      {selectedOrder.recipientName && (
                        <div className="address-field">
                          <strong>{selectedOrder.recipientName}</strong>
                        </div>
                      )}
                      {(selectedOrder.phoneNumber || selectedOrder.phone) && (
                        <div className="address-field">{selectedOrder.phoneNumber || selectedOrder.phone}</div>
                      )}
                      <div className="address-field">{selectedOrder.deliveryAddress}</div>
                    </>
                  ) : (
                    <div className="address-warning">⚠️ Delivery address not provided</div>
                  )}
                </div>
              </div>

              <div className="order-items-detail">
                <h3>Items</h3>
                {selectedOrder.items && selectedOrder.items.map((item, index) => (
                  <div key={index} className="detail-item-row">
                    <span>{item.name} x{item.quantity}</span>
                    <span>NT$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="detail-total">
                  <span>Total:</span>
                  <span>NT$ {selectedOrder.totalPrice?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="orders-table-container">
        <div className="table-header">
          <h2>All Orders ({orders.length})</h2>
        </div>
        
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders yet.</p>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Items Summary</th>
                  <th>Total Price</th>
                  <th>Order Status</th>
                  <th>Order Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-id-cell">
                      #{order._id.toString().slice(-8).toUpperCase()}
                    </td>
                    <td>{order.user?.name || 'Unknown'}</td>
                    <td>{getItemsSummary(order.items)}</td>
                    <td className="price-cell">NT$ {order.totalPrice?.toFixed(2)}</td>
                    <td>
                      <StatusToggle
                        status={order.status}
                        orderId={order._id}
                        onStatusChange={handleStatusChange}
                      />
                    </td>
                    <td>
                      {new Date(order.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-view"
                        onClick={() => handleViewDetails(order)}
                      >
                        View Details
                      </button>
                      {order.status === 'pending' && (
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;

