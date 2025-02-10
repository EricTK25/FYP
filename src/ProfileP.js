import React from "react";
import { Link } from "react-router-dom";
import "./profile.css"; 




import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';


const ProfileP = () => {
  const navigate = useNavigate();
  
  const handleregis = () => {
    navigate('/'); 
  };
  const handleregis2 = () => {
    navigate('/ProfileP'); 
  };
  return (
    <div className="profile-page">
      {/* Header */}
      <div className="navbar">
        <span className="app-title">Vehicle App</span>
        <button className="connect-wallet">Connect Wallet</button>
      </div>

      {/* Profile Section */}
      <div class="profile-container">
        <div class="profile-picture">
          <div class="camera-icon">
            <i class="icon-camera">📷</i> 
          </div>
        </div>
      </div>


      {/* Orders Section */}
      <section className="orders-section">
        <h2 className="title">My Orders</h2>
        <div className="underline"></div>
        <div className="orders">
          <div className="order">
            <i className="order-icon">💳</i>
            <p>Pending Payment</p>
          </div>
          <div className="order">
            <i className="order-icon">🚚</i>
            <p>Delivered</p>
          </div>
          <div className="order">
            <i className="order-icon">📄</i>
            <p>Processing</p>
          </div>
        </div>
      </section>

      {/* Options Section */}
      <section className="options-section">
        <Link to="/edit-profile" className="option">
          <span>Edit Profile</span>
          <span className="arrow"> > </span>
          
        </Link>
        <Link to="/shipping-address" className="option">
          <span>Shipping Address</span>
          <span className="arrow"> > </span>
          
        </Link>
        <Link to="/selling-management" className="option">
          <span>Selling Management</span>
          <span className="arrow"> > </span>
          
        </Link>
        <Link to="/logout" className="option">
          <span>Logout</span>
          <span className="arrow"> > </span>
          
        </Link>
      </section>

      {/* Footer Navigation */}
      <footer className="footer-nav">
        <nav className="nav-bar">
          <button className="nav-item"onClick={handleregis}>Home</button>
          <button className="nav-item">Search</button>
          <button className="nav-item">Sell</button>
          <button className="nav-item">Cart</button>
          <button className="nav-item"onClick={handleregis2}>Profile</button>
        </nav>
      </footer>
    </div>
  );
};


export default ProfileP;
