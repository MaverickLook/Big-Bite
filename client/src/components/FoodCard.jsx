import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './FoodCard.css';

const FoodCard = ({ id, name, price, description, image, category, rating, reviews, vegetarian, available }) => {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleAddToCart = () => {
    if (isAdmin) return;
    if (available === false) {
      // Prevent adding unavailable items
      return;
    }
    addToCart({ id, name, price, image, category, available });
    setIsAdded(true);
    
    setTimeout(() => setIsAdded(false), 1000);
  };

  const isImageUrl = image && (image.startsWith('http') || image.startsWith('data:image'));
  
  const isUnavailable = available === false;
  
  return (
    <div className={`food-card ${isUnavailable ? 'unavailable' : ''}`}>
      <div className="food-card-header">
        <div className="menu-image-wrapper">
          {isImageUrl ? (
            <img src={image} alt={name} className="food-image-img" />
          ) : (
            <span className="food-image-emoji">{image || '🍽️'}</span>
          )}
        </div>
        <span className={`category-badge ${category?.toLowerCase() || ''}`}>{category || 'Food'}</span>
        {vegetarian && <span className="vegetarian-badge">🌱 Vegetarian</span>}
      </div>

      <div className="food-card-body">
        <h3 className="food-name">{name}</h3>
        <p className="food-description">{description}</p>

        {(rating || reviews) && (
          <div className="food-rating">
            {rating && <span className="stars">⭐ {rating}</span>}
            {reviews && <span className="reviews">({reviews} reviews)</span>}
          </div>
        )}

        {isUnavailable && !isAdmin && (
          <div className="unavailable-message">
            ⚠️ This menu item is currently unavailable
          </div>
        )}

        <div className="food-card-footer">
          <span className="food-price">NT$ {price.toFixed(2)}</span>
          {!isAdmin && (
            <button 
              className={`add-to-cart-btn ${isAdded ? 'added' : ''} ${isUnavailable ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={isUnavailable}
              title={isUnavailable ? 'This item is currently unavailable and cannot be ordered' : ''}
            >
              {isUnavailable ? '❌ Unavailable' : isAdded ? '✓ Added' : '🛒 Add'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
