import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Redirect admins away from cart page (but allow guests)
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [user, isAuthenticated, navigate]);
  const { 
    cartItems, 
    removeFromCart, 
    increaseQuantity, 
    decreaseQuantity, 
    clearCart, 
    calculateTotal 
  } = useCart();

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      // Checkout page will handle redirect to login if user is not authenticated
      navigate('/checkout');
    }
  };

  const handleContinueShopping = () => {
    navigate('/menu');
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/menu" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container cart-page">
      <h1>Shopping Cart</h1>

      <div className="cart-container">
        {/* Cart Items Section */}
        <div className="cart-items-section">
          <div className="cart-header">
            <h2>Cart Items ({cartItems.length})</h2>
            <button 
              className="clear-cart-btn"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>

          <div className="cart-items">
            {cartItems.map((item) => {
              // Check if image is a URL (starts with http or data:) or an emoji
              const isImageUrl = item.image && (item.image.startsWith('http') || item.image.startsWith('data:image'));
              
              return (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    {isImageUrl ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="cart-item-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'inline-block';
                        }}
                      />
                    ) : null}
                    <span 
                      className="cart-item-emoji"
                      style={{ display: isImageUrl ? 'none' : 'inline-block' }}
                    >
                      {item.image || '🍽️'}
                    </span>
                  </div>

                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-category">{item.category}</p>
                    <p className="item-price">NT$ {item.price.toFixed(2)}</p>
                  </div>

                <div className="quantity-control">
                  <button 
                    className="qty-btn"
                    onClick={() => decreaseQuantity(item.id)}
                  >
                    −
                  </button>
                  <span className="qty-display">{item.quantity}</span>
                  <button 
                    className="qty-btn"
                    onClick={() => increaseQuantity(item.id)}
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  NT$ {(item.price * item.quantity).toFixed(2)}
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                  title="Remove from cart"
                >
                  ✕
                </button>
              </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Delivery Fee:</span>
            <span>NT$ 40.00</span>
          </div>

          

          <div className="summary-row total">
            <span>Total:</span>
            <span>NT$ {(calculateTotal() + 40.0 + calculateTotal() * 0.08).toFixed(2)}</span>
          </div>

          <button 
            className="btn btn-primary checkout-btn"
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>

          <button 
            className="btn btn-secondary continue-btn"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </button>

          <div className="trust-badges">
            {/* Trust badges removed per request */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
