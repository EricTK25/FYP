import React, { useState, useEffect } from "react";
import "./Search.css";
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';


const Search = () => {
  const [tokenInfo, setTokenInfo] = useState(null); // State for token info
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    // Simulate fetching token info (replace with actual API call)
    setTimeout(() => {
      const token = true; // Simulate token info (replace with actual logic)
      if (token) {
        setTokenInfo({
          cars: [
            { id: 1, name: "ULTRABOOST 22 SHOES", price: "$1499" },
            { id: 2, name: "ULTRABOOST 18 SHOES", price: "$1299" },
            { id: 3, name: "ULTRABOOST 19 SHOES", price: "$1399" },
            { id: 4, name: "ULTRABOOST 37 SHOES", price: "$1199" },
          ],
        });
      }
      setIsLoading(false);
    }, 2000); // Simulate 2 seconds loading
  }, []);
  const navigate = useNavigate();
  
  const handleregis = () => {
    navigate('/'); 
  };
  const handleregis2 = () => {
    navigate('/ProfileP'); 
  };
  const handlerSearch = () => {
    navigate('/Search'); 
  };
  return (
    <div className="app">
      {/* Navbar */}
      <div className="navbar">
        <span className="app-title">Vehicle App</span>
        <button className="connect-wallet">Connect Wallet</button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input type="text" placeholder="Search Your Vehicle" />
      </div>

      {/* Featured Brands */}
      <section className="featured-brands">
        <h2>Featured brands</h2>
        <div className="brands">
          <img src="Toyota.png" alt="Toyota" />
          <img src="honda.png" alt="Honda" />
          <img src="tesla.png" alt="Tesla" />
        </div>
      </section>

      {/* Watercrafts and Planes */}
      <section className="categories">
        <div>
          <h3>WaterCrafts / Ships</h3>
          <div className="category-items">
            <img src="kawasaki.png" alt="Kawasaki" />
            <img src="cosco.png" alt="COSCO Shipping" />
          </div>
        </div>
        <div>
          <h3>Planes</h3>
          <div className="category-items">
            <img src="cirrus.png" alt="Cirrus" />
            <img src="bombardier.png" alt="Bombardier" />
            <img src="embraer.png" alt="Embraer" />
          </div>
        </div>
      </section>

      {/* Daily Highlights */}
      <section className="daily-highlights">
        <h2>Daily Highlights</h2>
        {isLoading ? (
          <div className="loading">Loading cars...</div>
        ) : tokenInfo ? (
          <div className="car-grid">
            {tokenInfo.cars.map((car) => (
              <div key={car.id} className="car-card">
                <img src="car-placeholder.png" alt={car.name} />
                <h3>{car.name}</h3>
                <p>{car.price}</p>
                <button>Add to Cart</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">No cars available</div>
        )}
      </section>

      {/* Footer Navigation */}
      <footer className="footer-nav">
        <div className="nav-bar">
        <button className="nav-item"onClick={handleregis}>Home</button>
          <button className="nav-item"onClick={handlerSearch}>Search</button>
          <button className="nav-item">Sell</button>
          <button className="nav-item">Cart</button>
          <button className="nav-item"onClick={handleregis2}>Profile</button>
        </div>
      </footer>
    </div>
  );
};

export default Search;
