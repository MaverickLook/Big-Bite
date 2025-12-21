// Mock food data - will be replaced with real API calls later
export const mockFoodData = [
  {
    id: 1,
    name: 'Margherita Pizza',
    price: 12.99,
    description: 'Classic pizza with fresh mozzarella, basil, and tomato sauce',
    image: '🍕',
    category: 'Pizza',
    rating: 4.5,
    reviews: 128,
    vegetarian: true,
  },
  {
    id: 2,
    name: 'Pepperoni Pizza',
    price: 14.99,
    description: 'Delicious pepperoni pizza with mozzarella and tomato sauce',
    image: '🍕',
    category: 'Pizza',
    rating: 4.7,
    reviews: 256,
    vegetarian: false,
  },
  {
    id: 3,
    name: 'Caesar Salad',
    price: 8.99,
    description: 'Fresh romaine lettuce with parmesan cheese and croutons',
    image: '🥗',
    category: 'Salad',
    rating: 4.3,
    reviews: 89,
    vegetarian: true,
  },
  {
    id: 4,
    name: 'Grilled Chicken Sandwich',
    price: 11.99,
    description: 'Tender grilled chicken breast with fresh vegetables',
    image: '🥪',
    category: 'Sandwich',
    rating: 4.6,
    reviews: 145,
    vegetarian: false,
  },
  {
    id: 5,
    name: 'Vegetable Burger',
    price: 10.99,
    description: 'Delicious plant-based burger with lettuce, tomato, and special sauce',
    image: '🍔',
    category: 'Burger',
    rating: 4.4,
    reviews: 102,
    vegetarian: true,
  },
  {
    id: 6,
    name: 'Beef Burger',
    price: 12.99,
    description: 'Juicy beef burger with cheddar cheese, pickles, and onions',
    image: '🍔',
    category: 'Burger',
    rating: 4.8,
    reviews: 234,
    vegetarian: false,
  },
  {
    id: 7,
    name: 'Pasta Carbonara',
    price: 13.99,
    description: 'Creamy pasta with bacon, egg, and parmesan cheese',
    image: '🍝',
    category: 'Pasta',
    rating: 4.7,
    reviews: 167,
    vegetarian: false,
  },
  {
    id: 8,
    name: 'Vegetable Pasta',
    price: 11.99,
    description: 'Fresh pasta with seasonal vegetables and olive oil',
    image: '🍝',
    category: 'Pasta',
    rating: 4.5,
    reviews: 98,
    vegetarian: true,
  },
  {
    id: 9,
    name: 'Chocolate Cake',
    price: 6.99,
    description: 'Rich and moist chocolate cake with chocolate frosting',
    image: '🍰',
    category: 'Dessert',
    rating: 4.9,
    reviews: 289,
    vegetarian: true,
  },
  {
    id: 10,
    name: 'Lemonade',
    price: 3.99,
    description: 'Fresh homemade lemonade',
    image: '🥤',
    category: 'Drinks',
    rating: 4.4,
    reviews: 156,
    vegetarian: true,
  },
];

// Get unique categories
export const getCategories = () => {
  return [...new Set(mockFoodData.map(food => food.category))];
};

// Filter foods by category
export const getFoodsByCategory = (category) => {
  if (category === 'All') return mockFoodData;
  return mockFoodData.filter(food => food.category === category);
};
