import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import "../src/profile.css"; 
import { useEthereum } from './EthereumContext';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';



const ProfileP = () => {
  const navigate = useNavigate();
  const { account, connectWallet } = useEthereum();
  const [profile, setProfile] = useState(null);
  const [isPrompted, setIsPrompted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false); // 控制編輯表單的顯示
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (account) {
        try {
          const response = await axios.get(`http://localhost:5000/api/profile/${account}`);
          if (response.data.length > 0) {
            setProfile(response.data[0]);
            setName(response.data[0].name);
            setEmail(response.data[0].email);
            setPhoneNumber(response.data[0].phoneNumber);
          } else if (!isPrompted){
            setShowModal(true);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchProfile();
  }, [account]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newProfile = { address: account, name, email, phoneNumber };
    await axios.post('http://localhost:5000/api/profile', newProfile);
    setProfile(newProfile);
    setIsPrompted(true);
    setShowModal(false); 
    setShowEdit(false); 
  };

  const toggleEdit = () => {
    setShowEdit((prevShowEdit) => !prevShowEdit); 
  };

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
        {account ? (
          <span className="accountid">Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
        ) : (
          <button className="connect-wallet" onClick={connectWallet}>Connect Wallet</button>
        )}
      </div>

      {/* Profile Section */}
      <div class="profile-container">
        <div class="profile-picture">
          <div class="camera-icon">
            <i class="icon-camera">📷</i> 
          </div>
        </div>
      </div>

      <div className="profile-detail">
      <h2>Profile</h2>
      {profile ? (
        <div>
          <h3>{profile.name}</h3>
          <p>Email: {profile.email}</p>
          <p>Phone: {profile.phoneNumber}</p>
        </div>
      ) : ( <h3>
        You haven't connected to the metamask wallet or entered your personal information!
      </h3>
      )}
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
      <div className="option" onClick={toggleEdit}> 
          <span>Edit Profile</span>
          <span className="arrow"> > </span>
        </div>
        </section>
        {showEdit && (
  <div className="edit-form">
    <form onSubmit={handleSubmit}>
      <label>Name:</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <label>Email:</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <label>Phone:</label>
      <input
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      <button type="submit">Save</button>
      <button type="button" onClick={toggleEdit}>
        Cancel
      </button>
    </form>
  </div>
)}

         
<section className="options-section">  
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div class="modal-header">
              <h2>Please enter your information</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div>
                <label className='label-name'>Name</label>
                <input 
                  type="text" 
                  placeholder="Please enter your name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label>Email</label>
                <input 
                  type="email" 
                  placeholder="Please enter your email"   
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label>Phone</label>
                <input 
                  type="tel" 
                  placeholder="Please enter your phone number"   
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit">Submit</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileP;
