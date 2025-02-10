import React from "react";
import "./regis.css";
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';


const Regis = () => {
 
      const navigate = useNavigate();
    
      const handlesingin = (event) => {
        event.preventDefault(); 
        navigate('/'); 
      };

    return (
      <div className="app">
        {/* Header Section */}
        <header className="header">
          <h1 className="app-title">Vehicle App</h1>
          <button className="connect-wallet">Connect Wallet</button>
        </header>
  
        {/* Sign In Section */}
        <main className="sign-in-container">
          <div className="sign-in-box">
            <h2 className="sign-in-title">Sign Up</h2>
            <form className="sign-in-form">


            <label htmlFor="name" className="form-label">
                 Name
            </label>
                <input
                type="text"
                id="name"
                placeholder="Enter your name"
                className="form-input"
                />

              <label htmlFor="email" className="form-label">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="form-input"
                //onChange={(Event) =>{setName(Event.target.value)}}
              />
  
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="form-input"
              />
  
              <button type="submit" className="sign-in-button">
                Sign up
              </button>
            </form>
            <p className="terms">
              By signing-in you agree to the Carrier SHOP Conditions of Use & Sale. Please see our Privacy Notice, our Cookies Notice and our Interest-Based Ads Notice.
            </p>
            <button className="create-account" onClick={handlesingin}>Back to sign in</button>
          </div>
        </main>
  
        {/* Footer */}
        <footer className="footer-nav">
          <nav className="nav-bar">
            <button className="nav-item">Home</button>
            <button className="nav-item">Search</button>
            <button className="nav-item">Sell</button>
            <button className="nav-item">Cart</button>
            <button className="nav-item">Profile</button>
          </nav>
        </footer>
      </div>
    );
  };
  
  export default Regis;
  
  