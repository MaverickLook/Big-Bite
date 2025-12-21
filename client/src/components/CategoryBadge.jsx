import React from 'react';
import './CategoryBadge.css';

const CategoryBadge = ({ category }) => {
  // Handle empty, null, undefined, or whitespace-only categories
  // Also handle non-string types (convert to string first)
  const categoryStr = category ? String(category).trim() : '';
  
  if (!categoryStr) {
    return (
      <span className="category-badge category-uncategorized">Uncategorized</span>
    );
  }

  // Capitalize first letter and handle the rest
  const displayCategory = categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1).toLowerCase();
  
  // Map categories to colors
  const getCategoryClass = (cat) => {
    const lowerCat = cat.toLowerCase();
    if (lowerCat === 'pizza') return 'category-pizza';
    if (lowerCat === 'drink' || lowerCat === 'drinks') return 'category-drink';
    if (lowerCat === 'burger' || lowerCat === 'burgers') return 'category-burger';
    if (lowerCat === 'dessert' || lowerCat === 'desserts') return 'category-dessert';
    if (lowerCat === 'salad' || lowerCat === 'salads') return 'category-salad';
    if (lowerCat === 'sandwich' || lowerCat === 'sandwiches') return 'category-sandwich';
    if (lowerCat === 'pasta') return 'category-pasta';
    return 'category-default';
  };

  return (
    <span className={`category-badge ${getCategoryClass(categoryStr)}`}>
      {displayCategory}
    </span>
  );
};

export default CategoryBadge;

