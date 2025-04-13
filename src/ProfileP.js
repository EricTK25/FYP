import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import "../src/profile.css"; 
import { useEthereum } from './EthereumContext';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FooterNavigation from "./components/FooterNavigation";


const ProfileP = () => {
  const navigate = useNavigate();
  const { account, connectWallet,disconnectWallet} = useEthereum();
  const [profile, setProfile] = useState(null);
  const [isPrompted, setIsPrompted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false); 
  const [showIconUpload, setShowIconUpload] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileIcon, setProfileIcon] = useState(null); 
  const [shippingAddress, setShippingAddress] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  


  const fetchProfile = async () => {
    if (account) {
      try {
        const response = await axios.get(`http://localhost:5000/api/profile/${account}`);
        if (response.data.length > 0) {
          setProfile(response.data[0]);
          setName(response.data[0].name);
          setEmail(response.data[0].email);
          setPhoneNumber(response.data[0].phoneNumber);
          setShippingAddress(response.data[0].shippingAddress || '');
        } else if (!isPrompted) {
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [account]);

  //New profile submission
  const handleSaveProfile = async () => {
    console.log({
      name,
      email,
      phoneNumber,
    });
    try {
      const response = await axios.put(`http://localhost:5000/api/profile/${account}`, {
        name,
        email,
        phoneNumber,
      });
      setProfile(response.data);
      console.log("Profile updated successfully:", response.data); 
      fetchProfile();
      setShowEdit(false);
    } catch (error) {
      console.error("Error updating profile:", error.response ? error.response.data : error.message);
    }
  };
  
  //icon data
  const fetchProfileIcon = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/profile/icon/${account}`);
      const base64Image = response.data.icon;
      setProfileIcon(`data:image/png;base64,${base64Image}`); // place Base64 to data URL
    } catch (error) {
      console.error("get profile icon failed:", error);
    }
  };

  useEffect(() => {
    fetchProfileIcon();
  }, [account]);

  const handleIconUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('icon', file);

    try {
      await axios.post(`http://localhost:5000/api/profile/icon/${account}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert("Icon uploaded successfully!");
      setShowIconUpload(false);
      fetchProfileIcon();
    } catch (error) {
      console.error("Icon uploaded failed:", error);
    }
  };

//profile submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newProfile = { address: account, name, email, phoneNumber };
    try {
      if (profile) {

        await axios.put(`http://localhost:5000/api/profile/${account}`, newProfile);
      } else {

        await axios.post('http://localhost:5000/api/profile', { address: account, ...newProfile });
        setIsPrompted(true);
      }
      setProfile(newProfile);
      setShowModal(false);
    } catch (error) {
      console.error("Error submitting profile:", error);
    }
  };
//shipping address form
  const handleSaveAddress = async () => {
    try {
      await axios.put(`http://localhost:5000/api/profile/address/${account}`, {
        shippingAddress,
      });
      console.log("Shipping address updated successfully");
      setShowAddressForm(false); // 隱藏表單
      fetchProfile(); // 重新獲取用戶資料以更新顯示
    } catch (error) {
      console.error("Error updating shipping address:", error.response ? error.response.data : error.message);
    }
  };

  const toggleAddressForm = () => {
    setShowAddressForm((prev) => !prev);
  };
  
//edit profile
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


//logout wallet
  const handleLogout = () => {
    disconnectWallet(); 
    navigate('/'); 
  };

//UI
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
      <div className="profile-container">
        <div className="profile-picture">
            {profile && profile.icon_data && (
              <img
              src={profileIcon}
              alt="Profile Icon"
              style={{ width: '100px', height: '100px' }} // Adjust size
              />
            )}
        </div>
      </div>

      <div className="profile-detail">
      <h2>Profile</h2>
        {profile ? (
          <div>
            <h3>{profile.name}</h3>
            <p>Email: {profile.email}</p>
            <p>Phone: {profile.phoneNumber}</p>
            <p>Shipping Address: {shippingAddress ? shippingAddress : "Have not entered shipping address yet"}</p>
          
          {/* Options Section */}
          <section className="options-section">
            <div className="option" onClick={toggleEdit}> 
            <span>Edit Profile</span>
            <span className="arrow edit-arrow"> > </span>
            </div>
          {/*Edit From*/}
          {showEdit && (
            <div className="edit-form">
              <form>
                <label>Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required/>
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required/>
                <label>Phone:</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required/>
                <button type="button" onClick={handleSaveProfile}>
                  Save
                </button>
                <button type="button" onClick={toggleEdit}>
                  Cancel
                </button>
              </form>
            </div>
          )}
            <div className="option" onClick={toggleIconUpload}> 
            <span>Edit Icon</span>
            <span className="arrow icon-arrow"> > </span>
            </div>
            {showIconUpload && (
                <input type="file" accept="image/*" onChange={handleIconUpload} />
              )}
            <div className="option" onClick={toggleAddressForm}> 
  <span>Shipping Address</span>
  <span className="arrow ship-arrow"> > </span>
</div>
{showAddressForm && (
  <div className="address-form">
    <label>Shipping Address:</label>
    <input
      type="text"
      value={shippingAddress}
      onChange={(e) => setShippingAddress(e.target.value)}
      required
    />
    <button type="button" onClick={handleSaveAddress}>
      Save Address
    </button>
    <button type="button" onClick={toggleAddressForm}>
      Cancel
    </button>
  </div>
)}
            <Link to="/selling-management" className="option">
              <span>Selling Management</span>
              <span className="arrow"> > </span>
            </Link>

            <div className="option" onClick={handleLogout}> 
              <span>Logout</span>
              <span className="arrow"> > </span>
            </div>
            <div>
        </div>
          </section>
            </div>
      ) : ( <h3>
        You haven't connected to the metamask wallet or entered your personal information!
      </h3>
      )}
    </div>
  
      {/* Orders Section
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
      */}

      {/* Footer */}
      <FooterNavigation></FooterNavigation>

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
 