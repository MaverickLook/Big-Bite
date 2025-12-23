import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={`navbar modern ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-left">
        <Link to="/" className="logo">
          <img src="/big-bite-logo.png" alt="Big-Bite" className="logo-img" />
        </Link>
        <a 
          href="/01157161+01157155.pdf" 
          download="01157161+01157155.pdf"
          className="download-pdf-btn"
          title="Download Project PDF"
        >
          文件説明
        </a>
      </div>

      <div className="navbar-center">
        <ul className="nav-links">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Home
            </NavLink>
          </li>
          <li>
            <Link to="/menu" className="order-now-btn">
              Order Now
            </Link>
          </li>
          <li>
            <a 
              href="#contact" 
              className="contact-link"
              onClick={(e) => {
                e.preventDefault();
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  const offsetTop = contactSection.offsetTop - 90;
                  window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                  });
                } else {
                  navigate('/');
                  setTimeout(() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      const offsetTop = contactSection.offsetTop - 90;
                      window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                      });
                    }
                  }, 100);
                }
              }}
            >
              Contact
            </a>
          </li>
        </ul>
      </div>

      <div className="navbar-right">
        {(!isAuthenticated || user?.role !== 'admin') && (
          <Link to="/cart" className="cart-icon">
            🛒 Cart <span className="cart-count">{getItemCount()}</span>
          </Link>
        )}
        
        {isAuthenticated ? (
          <>
            {user?.role === 'admin' && (
              <Link to="/admin-dashboard" className="admin-link">
                Admin Panel
              </Link>
            )}
            <Link to="/account" className="user-icon">
              <span aria-hidden="true" style={{ marginRight: '0.35rem' }}>👤</span>
              {user?.name || 'Account'}
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/register" className="register-btn">Register</Link>
          </>
        )}
      </div>

      <button 
        className="menu-toggle" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        ☰
      </button>
    </nav>
  );
};

export default Navbar;
