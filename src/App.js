import React, { useState, useEffect } from "react";
import "./App.css"; // Make sure to create a CSS file for styling
import { ethers } from "ethers";
import config from "./config";
// Components
import Navigation from './components/Navigation';
import HeroSection from "./components/HeroSection";
import FooterNavigation from "./components/FooterNavigation";
import Section from "./components/Section";
// ABIs
import CarrierApp from "./abis/CarrierApp.json";

function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acc, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredCars, setFilteredCars] = useState([]);
    const [dailyHighlights, setDailyHighlights] = useState([]);
    const [cart, setCart] = useState([]);

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
          <Section
          items={dailyHighlights}
          cart={cart}
          setCart={setCart}
        />
        )}
      </div>

      {/* Footer */}
      <FooterNavigation></FooterNavigation>
    </div>
  );
}


export default App;