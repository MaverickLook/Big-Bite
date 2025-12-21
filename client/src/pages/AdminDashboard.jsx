import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          <NavLink to="/admin-dashboard" end>Dashboard Home</NavLink>
          <NavLink to="/admin-dashboard/menu-management">Menu Management</NavLink>
          <NavLink to="/admin-dashboard/orders">Orders</NavLink>
          <NavLink to="/admin-dashboard/analytics">Analytics</NavLink>
        </nav>
      </div>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;

