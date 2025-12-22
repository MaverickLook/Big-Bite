import React from 'react';
import CurrentOrderStatus from '../components/CurrentOrderStatus';
import OrderStatusBanner from '../components/OrderStatusBanner';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Order Status Banner - Between Navbar and Hero */}
      <OrderStatusBanner />

      {/* Hero Section */}
      <section 
        className="hero"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/menu-background.png)`,
        }}
      >
        <div className="hero-content">
          <h1 className="hero-title">BIG BITE RESTAURANT</h1>
          <p className="hero-subtitle">BEST WESTERN RESTAURANT IN TOWN</p>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="contact-section">
        <div className="contact-container">
          <h2 className="contact-title">CONTACT US</h2>
          
          <div className="contact-content">
            {/* Left Column - Contact Information */}
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-label">EMAIL</div>
                <div className="contact-value">bigbite@gmail.com</div>
              </div>
              
              <div className="contact-item">
                <div className="contact-label">ADDRESS</div>
                <div className="contact-value">
                  Keelung City, Zhongzheng District<br />
                  Beining Road No. 2
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-label">CONTACT NUMBER</div>
                <div className="contact-value">+886 9123 456</div>
              </div>
            </div>

            {/* Right Column - Operating Hours */}
            <div className="operating-hours">
              <h3 className="hours-title">OPERATING HOURS</h3>
              <div className="hours-content">
                <div className="hours-row">
                  <span className="hours-day">Monday – Friday</span>
                  <span className="hours-time">10:00 AM – 8:00 PM</span>
                </div>
                <div className="hours-row">
                  <span className="hours-day">Saturday – Sunday</span>
                  <span className="hours-time">10:00 AM – 10:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default HomePage;
