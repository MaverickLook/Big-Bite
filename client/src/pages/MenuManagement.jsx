import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './MenuManagement.css';

const MenuManagement = () => {
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    available: true,
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch all foods
  const fetchFoods = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/foods');
      // Debug: Log sample item to verify category field exists
      if (response.data && response.data.length > 0) {
        const sample = response.data[0];
        console.log('[MenuManagement] Foods fetched. Sample item:', {
          name: sample.name,
          hasCategory: 'category' in sample,
          categoryValue: sample.category,
          categoryType: typeof sample.category,
          allFields: Object.keys(sample)
        });
        // Log all items' categories
        response.data.forEach((food, idx) => {
          console.log(`[MenuManagement] Food[${idx}] "${food.name}": category =`, food.category);
        });
      }
      setFoods(response.data);
    } catch (err) {
      setError('Failed to load menu items. Please try again.');
      console.error('Error fetching foods:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({ ...prev, image: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate category is selected
    if (!formData.category || formData.category.trim() === '') {
      setError('Please select a category for this item');
      return;
    }
    
    try {
      const foodData = {
        ...formData,
        price: parseFloat(formData.price),
        category: formData.category.trim(), // Ensure category is trimmed and saved
      };

      if (editingFood) {
        // Update existing food
        await api.put(`/foods/${editingFood._id}`, foodData);
      } else {
        // Create new food
        await api.post('/foods', foodData);
      }

      // Reset form and refresh list
      resetForm();
      fetchFoods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save food item');
      console.error('Error saving food:', err);
    }
  };

  // Handle edit button click
  const handleEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name || '',
      description: food.description || '',
      price: food.price || '',
      category: food.category || '',
      image: food.image || '',
      available: food.available !== undefined ? food.available : true,
    });
    setImagePreview(food.image || null);
    setShowForm(true);
  };

  // Handle delete button click
  const handleDelete = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await api.delete(`/foods/${foodId}`);
      fetchFoods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete food item');
      console.error('Error deleting food:', err);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      available: true,
    });
    setImagePreview(null);
    setEditingFood(null);
    setShowForm(false);
    setError(null);
  };

  // Get unique categories from foods
  const categories = ['Pizza', 'Burger', 'Salad', 'Sandwich', 'Pasta', 'Drink', 'Dessert'];

  if (isLoading) {
    return (
      <div className="menu-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-management">
      <div className="menu-management-header">
        <h1>🍽️ Menu Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          ➕ Add New Item
        </button>
      </div>

      {error && !showForm && (
        <div className="error-message">{error}</div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="menu-form-container">
          <div className="menu-form">
            <div className="form-header">
              <h2>{editingFood ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
              <button className="close-btn" onClick={resetForm}>✕</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Margherita Pizza"
                  />
                </div>

                <div className="form-group">
                    <label htmlFor="price">Price (NT$) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g., 12.99"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Describe the food item..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="image">Image</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: '' }));
                        }}
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                  <small className="form-hint">Select an image file from your computer (max 5MB)</small>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleInputChange}
                  />
                  Available (show on menu)
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFood ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Items Table */}
      <div className="menu-items-container">
        <h2>Menu Items ({foods.length})</h2>
        
        {foods.length === 0 ? (
          <div className="empty-state">
            <p>No menu items yet. Click "Add New Item" to get started!</p>
          </div>
        ) : (
          <div className="menu-items-table">
            <table>
              <thead>
                <tr>
                  <th className="col-image">Image</th>
                  <th className="col-name">Name</th>
                  <th className="col-category">Category</th>
                  <th className="col-price">Price</th>
                  <th className="col-status">Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food) => (
                  <tr key={food._id || food.id}>
                    <td className="image-cell">
                      {food.image ? (
                        <img 
                          src={food.image} 
                          alt={food.name} 
                          className="food-image-thumbnail"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'inline-block';
                          }}
                        />
                      ) : null}
                      <span className="food-emoji-fallback" style={{ display: food.image ? 'none' : 'inline-block' }}>
                        🍽️
                      </span>
                    </td>
                    <td className="name-cell">
                      <div className="name-primary">{food.name}</div>
                      {food.description && (
                        <div className="name-description" title={food.description}>
                          {food.description.length > 50 
                            ? `${food.description.substring(0, 50)}...` 
                            : food.description}
                        </div>
                      )}
                    </td>
                    <td className="category-cell">
                      {food.category || '-'}
                    </td>
                    <td className="price-cell">NT$ {food.price?.toFixed(2)}</td>
                    <td className="status-cell">
                      <span className={`status-badge ${food.available ? 'available' : 'unavailable'}`}>
                        {food.available ? '✓ Available' : '✗ Unavailable'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(food)}
                          title="Edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(food._id)}
                          title="Delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
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

export default MenuManagement;

