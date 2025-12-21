import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminProtectedRoute from './AdminProtectedRoute';

// Pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import MenuPage from '../pages/MenuPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderTrackingPage from '../pages/OrderTrackingPage';
import OrderStatusPage from '../pages/OrderStatusPage';
import AccountPage from '../pages/AccountPage';
import EditProfilePage from '../pages/EditProfilePage';
import AdminDashboard from '../pages/AdminDashboard';
import DashboardHome from '../pages/DashboardHome';
import MenuManagement from '../pages/MenuManagement';
import OrdersManagement from '../pages/OrdersManagement';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import NotFoundPage from '../pages/NotFoundPage';
import GoogleSuccessPage from '../pages/GoogleSuccessPage';

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/google-success" element={<GoogleSuccessPage />} />

      {/* Public Cart Route (accessible to guests) */}
      <Route path="/cart" element={<CartPage />} />
      
      {/* Protected Routes */}
      <Route 
        path="/checkout" 
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/order-tracking" 
        element={
          <ProtectedRoute>
            <OrderTrackingPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/order/:orderId" 
        element={
          <ProtectedRoute>
            <OrderStatusPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/account" 
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/account/edit" 
        element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin-dashboard" 
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="menu-management" element={<MenuManagement />} />
        <Route path="orders" element={<OrdersManagement />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
