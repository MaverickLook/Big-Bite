import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from localStorage on mount
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (food) => {
    // Prevent adding unavailable items
    if (food.available === false) {
      console.warn('Cannot add unavailable item to cart:', food.name);
      return;
    }

    setCartItems((prevItems) => {
      // Check if item already exists in cart
      const existingItem = prevItems.find((item) => item.id === food.id);

      if (existingItem) {
        // If item exists, increase quantity (only if still available)
        if (existingItem.available === false) {
          return prevItems; // Don't update if unavailable
        }
        return prevItems.map((item) =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item to cart
        return [
          ...prevItems,
          {
            id: food.id,
            name: food.name,
            price: food.price,
            image: food.image,
            category: food.category,
            available: food.available !== false, // Ensure available flag is set
            quantity: 1,
          },
        ];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (foodId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== foodId)
    );
  };

  // Update item quantity
  const updateQuantity = (foodId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === foodId ? { ...item, quantity } : item
      )
    );
  };

  // Increase quantity
  const increaseQuantity = (foodId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === foodId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (foodId) => {
    setCartItems((prevItems) => {
      const item = prevItems.find((i) => i.id === foodId);

      if (item && item.quantity === 1) {
        // Remove item if quantity is 1
        return prevItems.filter((i) => i.id !== foodId);
      } else {
        // Decrease quantity
        return prevItems.map((i) =>
          i.id === foodId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
    });
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Calculate item count
  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Merge items into cart (used for merging guest cart after login)
  const mergeCartItems = (itemsToMerge) => {
    setCartItems((prevItems) => {
      const merged = [...prevItems];
      
      itemsToMerge.forEach((newItem) => {
        const existingItem = merged.find((item) => item.id === newItem.id);
        
        if (existingItem) {
          // Merge quantities if item already exists
          existingItem.quantity += newItem.quantity;
        } else {
          // Add new item
          merged.push({
            id: newItem.id,
            name: newItem.name,
            price: newItem.price,
            image: newItem.image,
            category: newItem.category,
            available: newItem.available !== false,
            quantity: newItem.quantity,
          });
        }
      });
      
      return merged;
    });
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    calculateTotal,
    getItemCount,
    mergeCartItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export default CartContext;
