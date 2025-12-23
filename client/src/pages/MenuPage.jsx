import React, { useState, useEffect, useCallback } from 'react';
import FoodCard from '../components/FoodCard';
import api from '../services/api';
import './MenuPage.css';

const MenuPage = () => {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const fetchFoods = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }

      // load from backend
      const response = await api.get('/foods');
      const apiFoods = response.data || [];

      setFoods(apiFoods);
      setFilteredFoods(apiFoods);

      //categories from API data
      const uniqueCategories = [
        'All',
        ...Array.from(new Set(apiFoods.map((food) => food.category).filter(Boolean))),
      ];
      setCategories(uniqueCategories);
    } catch (err) {
      if (!silent) {
        setError('Failed to load menu. Please try again.');
        console.error('Error fetching foods:', err);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  // fetch and setup polling
  useEffect(() => {
    fetchFoods();

    //auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchFoods({ silent: true });
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchFoods]);

  // Filter foods by category and search term
  useEffect(() => {
    let filtered = foods;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((food) => food.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (food.description && food.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredFoods(filtered);
  }, [selectedCategory, searchTerm, foods]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };



  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container menu-page">
      <div className="menu-header">
        <h1>Big-Bite Menu</h1>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search for food..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <h3>Categories</h3>
        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Food Count Info */}
      <div className="food-info">
        <p>{filteredFoods.length} items available</p>
      </div>

      {/* Foods Grid */}
      {filteredFoods.length > 0 ? (
        <div className="foods-grid">
          {filteredFoods.map((food) => (
            <FoodCard
              key={food._id || food.id}
              id={food._id || food.id}
              {...food}
            />
          ))}
        </div>
      ) : (
        <div className="no-foods-container">
          <p className="no-foods-message">
            No foods found. Try a different search or category.
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
