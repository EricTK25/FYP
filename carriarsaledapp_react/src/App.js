import React, { useState, useEffect } from "react";
import "./App.css"; // Make sure to create a CSS file for styling
import { Link } from 'react-router-dom';
import { useEthereum } from './EthereumContext';
function App() {
  const { account, connectWallet } = useEthereum();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching car data based on tokenId
  const fetchCars = async () => {
    setLoading(true);

    // Simulate fetching data
    const carData = [
      {
        tokenId: 1,
        name: "car",
        price: 1488,
        image: "https://via.placeholder.com/150",
      },
      {
        tokenId: 2,
        name: "ship",
        price: 888,
        image: "https://via.placeholder.com/150",
      },
      {
        tokenId: 3,
        name: "boat",
        price: 849,
        image: "https://via.placeholder.com/150",
      },
      {
        tokenId: 4,
        name: "piko",
        price: 693,
        image: "https://via.placeholder.com/150",
      },
      {
        tokenId: 5,
        name: "GTR",
        price: 469,
        image: "https://via.placeholder.com/150",
      },
      {
        tokenId: 6,
        name: "AE86",
        price: 450,
        image: "https://via.placeholder.com/150",
      },
    ];

    // Simulate delay (e.g., blockchain call)
    setTimeout(() => {
      setCars(carData);
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    fetchCars();
  }, []);

  return (
    <div className="App">
      {/* Navbar */}
      <div className="navbar">
        <span className="app-title">Vehicle App</span>
        <button className="connect-wallet">Connect Wallet</button>
      </div>

      {/* The car and men  */}
      <div className="hero-section">
      <img src="/homecar.png" alt="My Description" />
      </div>

      {/* Top Sellers Section */}
      <h2 className="section-title">TOP SELLERS</h2>
      <div className="car-list">
        {loading ? (
          <p>Loading cars...</p>
        ) : (
          cars.map((car) => (
            <div key={car.tokenId} className="car-card">
              <img src={car.image} alt={car.name} className="car-image" />
              <h3>{car.name}</h3>
              <p>${car.price}</p>
              <button className="add-to-cart">purchase</button>
            </div>
          ))
        )}
      </div>

      <nav>
        <Link to="/mint">Mint</Link>
        <Link to="/my-tokens">My Tokens</Link>
        
        {account ? (
          <span>Connected: {account.slice(0,6)}...{account.slice(-4)}</span>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
        <p>{account}</p>
      </nav>

      {/* Footer */}
      <footer className="footer-nav">
        <nav className="nav-bar">
          <button className="nav-item"onClick={'/'}>Home</button>
          <button className="nav-item"onClick={'/Search'}>Search</button>
          <button className="nav-item">Sell</button>
          <button className="nav-item">Cart</button>
          <button className="nav-item"onClick={'ProfileP'}>Profile</button>
        </nav>
      </footer>
    </div>
  );
}


export default App;