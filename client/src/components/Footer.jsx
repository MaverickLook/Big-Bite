import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }
  };

  const handleContactClick = (e) => {
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
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left Column - Logo */}
        <div className="footer-logo">
          <img src="/big-bite-logo.png" alt="Big-Bite" className="footer-logo-img" />
        </div>

        {/* Center Column - Navigation */}
        <div className="footer-nav">
          <button onClick={handleHomeClick} className="footer-link">Home</button>
          <Link to="/menu" className="footer-link">Menu</Link>
          <button onClick={handleContactClick} className="footer-link">Contact</button>
        </div>

        {/* Right Column - Contact Info */}
        <div className="footer-contact">
          <div className="footer-contact-item">
            <span className="footer-contact-label">ADDRESS</span>
            <span className="footer-contact-value">Keelung City, Zhongzheng District, Beining Road No. 2</span>
          </div>
          <div className="footer-contact-item">
            <span className="footer-contact-label">PHONE</span>
            <span className="footer-contact-value">+886 9123 456</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
