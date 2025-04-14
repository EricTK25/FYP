import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import "./Search.css";

// Components
import FooterNavigation from "./components/FooterNavigation";
import Navigation from './components/Navigation';
import Section from "./components/Section";

// ABIs
import CarrierApp from './abis/CarrierApp.json';

// Config
import config from './config.json';

const Search = () => {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [cars, setCar] = useState([]); 
  const [filteredCars, setFilteredCars] = useState([]); 
  const [dailyHighlights, setDailyHighlights] = useState([]); 
  const [cart, setCart] = useState([]); 

  // Load cart data from localStorage on initial load
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    setCart(storedCart);
  }, []);

  // Save cart data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shoppingCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        const network = await provider.getNetwork();
        const carrierApp = new ethers.Contract(
          config[network.chainId].CarrierApp.address,
          CarrierApp,
          provider
        );

        const totalItems = 9; 
        const items = [];
        for (let i = 0; i < totalItems; i++) {
          const item = await carrierApp.items(i + 1);
          items.push({
            id: item.id.toString(),
            name: item.name,
            cost: ethers.formatUnits(item.cost.toString(), "ether"),
            image: item.image,
            stock: item.stock.toString(),
            category: item.category,
          });
        }
        setCar(items);
        setDailyHighlights(items.sort(() => Math.random() - Math.random()).slice(0, 3));
      } catch (error) {
        console.error("Error loading vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBlockchainData();
  }, []);

  useEffect(() => {
    const filtered = cars.filter(vehicle => 
      (vehicle.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCars(filtered);
  }, [searchTerm, cars]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="app">
      <Navigation />

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Your Vehicle"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Conditionally Render Featured Brands and Daily Highlights */}
      {searchTerm.trim() === "" && (
        <>
          <div className="featured-brands">
            <h3>Featured Brands</h3>
            <div className="brands-container">
              <img src="toyota.png" alt="Toyota" className="brand-logo" />
              <img src="honda.png" alt="Honda" className="brand-logo" />
              <img src="tesla.png" alt="Tesla" className="brand-logo" />
              <img src="Audi.png" alt="Audi" className="brand-logo" />
              <img src="BMW.webp" alt="BMW" className="brand-logo" />
              <img src="DaeWoo.png" alt="DaeWoo" className="brand-logo" />
              <img src="Ford.jpeg" alt="Ford" className="brand-logo" />
              <img src="Holden.png" alt="Holden" className="brand-logo" />
              <img src="jaguar.jpg" alt="jaguar" className="brand-logo" />
            </div>
          </div>

          {/* Daily Highlights Section */}
          <Section
            title={"Daily Highlights"}
            items={dailyHighlights}
            cart={cart}
            setCart={setCart}
          />
        </>
      )}

      {/* Conditionally Render Search Results */}
      {searchTerm.trim() !== "" && (
        <Section
          title={"Search Results"}
          items={filteredCars}
          cart={cart}
          setCart={setCart}
        />
      )}

      <FooterNavigation />
    </div>
  );
};

export default Search;
