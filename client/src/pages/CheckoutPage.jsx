import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const hasPrefilledRef = useRef(false);

  const { cartItems, calculateTotal, clearCart } = useCart();

  // Redirect guests to login page (with return path)
  useEffect(() => {
    if (!isAuthenticated) {
      // Store the intended checkout destination
      localStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login', { replace: true });
      return;
    }
    
    // Redirect admins away from checkout page
    if (user?.role === 'admin') {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [user, isAuthenticated, navigate]);

  // Ensure we have the latest profile before prefilling checkout fields
  useEffect(() => {
    refreshProfile?.();
  }, [refreshProfile]);

  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    paymentMethod: 'cash'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Prefill from user profile (single source of truth) - only once, and only if inputs are empty
  useEffect(() => {
    if (hasPrefilledRef.current) return;
    if (!user) return;

    const nextAddress = (user.deliveryAddress || '').trim();
    const nextPhone = (user.phoneNumber || '').trim();

    // Only prefill if we actually have values and the user hasn't typed anything yet
    if (!nextAddress && !nextPhone) return;

    setFormData((prev) => ({
      ...prev,
      address: prev.address.trim() === '' ? nextAddress : prev.address,
      phone: prev.phone.trim() === '' ? nextPhone : prev.phone,
    }));

    hasPrefilledRef.current = true;
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.address.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    // Filter out unavailable items from cart
    const availableItems = cartItems.filter(item => item.available !== false);
    
    if (availableItems.length === 0) {
      setError('All items in your cart are currently unavailable. Please remove them and add available items.');
      return;
    }

    if (availableItems.length < cartItems.length) {
      setError('Some items in your cart are currently unavailable and have been removed. Please review your order.');
      // You could optionally update the cart here to remove unavailable items
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert cart items to order format (only available items)
      const orderItems = availableItems.map(item => ({
        foodId: item.id,
        quantity: item.quantity
      }));

      // Create order with delivery information
      const response = await api.post('/orders', {
        items: orderItems,
        deliveryAddress: formData.address.trim(),
        phoneNumber: formData.phone.trim(),
        recipientName: user?.name || undefined
      });

      const order = response.data;
      
      // Clear cart
      clearCart();
      
      // Redirect to order status page
      navigate(`/order/${order._id}`);
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const subtotal = calculateTotal();
  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  return (
    <div className="page-container checkout-page">
      <h1>Checkout</h1>
      
      {error && <div className="error-message">{error}</div>}

      <div className="checkout-container">
        {/* Order Summary */}
        <div className="order-summary-section">
          <h2>Order Summary</h2>
          <div className="order-items-list">
            {cartItems.filter(item => item.available !== false).map((item) => (
              <div key={item.id} className="order-item-summary">
                <div className="item-info-summary">
                  <span className="item-name-summary">{item.name}</span>
                  <span className="item-quantity-summary">Qty: {item.quantity}</span>
                </div>
                <span className="item-price-summary">
                  NT$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            {cartItems.filter(item => item.available === false).length > 0 && (
              <div className="unavailable-items-warning">
                ⚠️ {cartItems.filter(item => item.available === false).length} unavailable item(s) removed from order
              </div>
            )}
          </div>
          
          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>NT$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Delivery Fee:</span>
              <span>NT$ {deliveryFee.toFixed(2)}</span>
            </div>

            <div className="total-row total-final">
              <span>Total:</span>
              <span>NT$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery & Payment Form */}
        <div className="checkout-form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Delivery Information</h2>
              
              <div className="form-group">
                <label htmlFor="address">Delivery Address *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Enter your delivery address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Payment Method</h2>
              
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleInputChange}
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-place-order"
              disabled={isSubmitting || cartItems.length === 0}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
