import axios from 'axios';

console.log("API_BASE_URL =", process.env.REACT_APP_API_URL);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired, clear it
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (name, email, password) => 
    api.post('/auth/register', { name, email, password }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getProfile: () => 
    api.get('/auth/profile'),

  updateProfile: ({ name, phoneNumber, deliveryAddress }) =>
    api.put('/auth/profile', { name, phoneNumber, deliveryAddress }),
  
  googleLogin: (googleToken) => 
    api.post('/auth/google-login', { token: googleToken }),
  
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }),
};

export default api;
