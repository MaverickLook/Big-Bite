import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          <NavLink to="/admin-dashboard" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
            <span className="nav-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="8" height="8" rx="2"></rect>
                <rect x="13" y="3" width="8" height="8" rx="2"></rect>
                <rect x="3" y="13" width="8" height="8" rx="2"></rect>
                <rect x="13" y="13" width="8" height="8" rx="2"></rect>
              </svg>
            </span>
            <span className="nav-label">Dashboard Home</span>
          </NavLink>
          <NavLink to="/admin-dashboard/menu-management" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            <span className="nav-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="6" r="2"></circle>
                <rect x="9" y="5" width="10" height="2" rx="1"></rect>
                <circle cx="5" cy="12" r="2"></circle>
                <rect x="9" y="11" width="10" height="2" rx="1"></rect>
                <circle cx="5" cy="18" r="2"></circle>
                <rect x="9" y="17" width="10" height="2" rx="1"></rect>
              </svg>
            </span>
            <span className="nav-label">Menu Management</span>
          </NavLink>
          <NavLink to="/admin-dashboard/orders" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            <span className="nav-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="7" width="16" height="13" rx="2"></rect>
                <path d="M9 7c0-2 1.5-3 3-3s3 1 3 3" fill="none" stroke="currentColor" strokeWidth="2"></path>
              </svg>
            </span>
            <span className="nav-label">Orders</span>
          </NavLink>
          <NavLink to="/admin-dashboard/analytics" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            <span className="nav-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="10" width="3" height="8" rx="1"></rect>
                <rect x="10" y="6" width="3" height="12" rx="1"></rect>
                <rect x="16" y="13" width="3" height="5" rx="1"></rect>
              </svg>
            </span>
            <span className="nav-label">Analytics</span>
          </NavLink>
        </nav>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;

