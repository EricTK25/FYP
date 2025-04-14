import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../src/profile.css";
import { useEthereum } from './EthereumContext';
import FooterNavigation from "./components/FooterNavigation";
import Navigation from './components/Navigation';
import Gun from 'gun';
import axios from 'axios';
const gun = Gun();

const ProfileP = () => {
  const navigate = useNavigate();
  const { account, disconnectWallet } = useEthereum();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    profileIcon: null,
    shippingAddress: ''
  });
  const [isPrompted, setIsPrompted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showIconUpload, setShowIconUpload] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (account) {
      setLoading(true);
      const userNode = gun.get(`user_${account}`).get('profile');
      userNode.once((data) => {
        if (data) {
          setProfile(data);
        } else if (!isPrompted) {
          setShowModal(true);
        }
        setLoading(false);
      });
    }
  }, [account, isPrompted]);

  const handleSaveProfile = () => {
    const userNode = gun.get(`user_${account}`).get('profile');
    userNode.put(profile);
    alert("Information uploaded successfully!");
    setShowEdit(false);
  };

  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const userNode = gun.get(`user_${account}`).get('profile');
      userNode.put({ profileIcon: base64String });
      setProfile(prevProfile => ({ ...prevProfile, profileIcon: base64String }));
      alert("Icon uploaded successfully!");
      setShowIconUpload(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userNode = gun.get(`user_${account}`).get('profile');
    userNode.put(profile);
    setIsPrompted(true);
    setShowModal(false);
  };

  const handleLogout = () => {
    disconnectWallet();
    navigate('/');
  };

  const toggleEdit = () => {
    setShowEdit((prevShowEdit) => {
      const newShowEdit = !prevShowEdit;
      const editArrow = document.querySelector('.edit-arrow');
      if (newShowEdit) {
        editArrow.textContent = ' v ';
      } else {
        editArrow.textContent = ' > ';
      }
      return newShowEdit;
    });
  };
  const toggleIconUpload = () => {
    setShowIconUpload((prevShowIconUpload) => {
      const newShowIconUpload = !prevShowIconUpload;
      const iconArrow = document.querySelector('.icon-arrow');
      if (newShowIconUpload) {
        iconArrow.textContent = ' v ';
      } else {
        iconArrow.textContent = ' > ';
      }
      return newShowIconUpload;
    });
  };

  const handleSaveAddress = () => {
    const userNode = gun.get(`user_${account}`).get('profile');
  
    userNode.once((data) => {
      if (!data) {
        console.error("Profile not found");
        return;
      }

      userNode.put({ shippingAddress: profile.shippingAddress }, (ack) => {
        if (ack.err) {
          console.error("Error updating shipping address:", ack.err);
        } else {
          console.log("Shipping address updated successfully");
          setShowAddressForm(false);
        }
      });
    });
  };
  
  const toggleAddressForm = () => {
    setShowAddressForm((prevShowAddress) => {
      const newShowAddress = !prevShowAddress;
      const AddressArrow = document.querySelector('.ship-arrow');
      if (newShowAddress) {
        AddressArrow.textContent = ' v ';
      } else {
        AddressArrow.textContent = ' > ';
      }
      return newShowAddress;
    });
  };
  //const toggleIconUpload = () => setShowIconUpload(!showIconUpload);
  //const toggleAddressForm = () => setShowAddressForm(!showAddressForm);

  return (
    <div className="profile-page">
      <Navigation />
      <div className="profile-container">
        <div className="profile-picture">
          {profile.profileIcon && (
            <img
              src={profile.profileIcon}
              alt="Profile Icon"
              style={{ width: '100px', height: '100px' }}
            />
          )}
        </div>
      </div>

      <div className="profile-detail">
        <h2>Profile</h2>
        {profile.name ? (
          <div>
            <h3>{profile.name}</h3>
            <p>Email: {profile.email}</p>
            <p>Phone: {profile.phoneNumber}</p>
            <p>Shipping Address: {profile.shippingAddress || "Have not entered shipping address yet"}</p>

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
            <section className="options-section">
              <div className="option" onClick={toggleEdit}>
                <span>Edit Profile</span>
                <span className="arrow edit-arrow"> > </span>
              </div>
              </section>
              {showEdit && (
                <div className="edit-form">
                  <form>
                    <label>Name:</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                    <label>Email:</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      required
                    />
                    <label>Phone:</label>
                    <input
                      type="tel"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      required
                    />
                    <button type="button" onClick={handleSaveProfile}>Save</button>
                    <button type="button" onClick={toggleEdit}>Cancel</button>
                  </form>
                </div>
              )}
               <section className="options-section">
              <div className="option" onClick={toggleIconUpload}>
                <span>Edit Icon</span>
                <span className="arrow icon-arrow"> > </span>
              </div>
              </section>
              {showIconUpload && (
                <div className="icon-upload">
                  <br />
                <input type="file" accept="image/*" onChange={handleIconUpload} />
                <br />
                </div>
              )}
              <section className="options-section">
              <div className="option" onClick={toggleAddressForm}>
                <span>Shipping Address</span>
                <span className="arrow ship-arrow"> > </span>
              </div>
              </section>
              {showAddressForm && (
                <div className="address-form">
                  <br />
                  <label>Shipping Address:</label>
                  <input
                    type="text"
                    value={profile.shippingAddress}
                    onChange={(e) => setProfile({ ...profile, shippingAddress: e.target.value })}
                    required
                  />
                  <button type="button" onClick={handleSaveAddress}>Save Address</button>
                  <button type="button" onClick={toggleAddressForm}>Cancel</button>
                  <br />
                </div>
              )}
              <section className="options-section">
              <Link to="/selling-management" className="option">
                <span>Selling Management</span>
                <span className="arrow"> > </span>
              </Link>
              </section>
              <section className="options-section">
              <div className="option" onClick={handleLogout}>
                <span>Logout</span>
              </div>
              </section>
          </div>
        ) : (
          <h3>You haven't connected to the MetaMask wallet or entered your personal information!</h3>
        )}
      </div>
      <FooterNavigation />
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Please enter your information</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div>
                <label className='label-name'>Name</label>
                <input
                  type="text"
                  placeholder="Please enter your name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Please enter your email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="Please enter your phone number"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
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
