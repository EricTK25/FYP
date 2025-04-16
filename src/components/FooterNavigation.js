import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import { MdSell } from 'react-icons/md';
import '../App.css';

function FooterNavigation() {
  const navigate = useNavigate();

  return (
    <footer className="footer-nav">
      <nav className="nav-bar">
        <button className="nav-item" onClick={() => navigate('/')}>
          <FaHome className="icon" />
          <span className="nav-text">Home</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/Search')}>
          <FaSearch className="icon" />
          <span className="nav-text">Search</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/mint')}>
          <MdSell className="icon" />
          <span className="nav-text">Sell</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/Cart')}>
          <FaShoppingCart className="icon" />
          <span className="nav-text">Cart</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/ProfileP')}>
          <FaUser className="icon" />
          <span className="nav-text">Profile</span>
        </button>
      </nav>
    </footer>
  );
}

export default FooterNavigation;