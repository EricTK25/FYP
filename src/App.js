import React, { useState, useEffect } from "react";
import { ethers } from 'ethers'
import "./App.css"; // Make sure to create a CSS file for styling

// Components
import Navigation from './components/Navigation';
import HeroSection from "./components/HeroSection";
import FooterNavigation from "./components/FooterNavigation";

// ABIs
import CarrierApp from './abis/CarrierApp.json'

// Config
import config from './config.json'
import { useEthereum } from './EthereumContext';

function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acc, setAccount] = useState(null);

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
      <Navigation account={acc} setAccount={setAccount} />
      {/* Hero Section  */}
      <HeroSection/>
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

      {/* Footer */}
      <FooterNavigation></FooterNavigation>
    </div>
  );
}


export default App;