import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./Search.css";

// Components
import FooterNavigation from "./components/FooterNavigation";
import Navigation from "./components/Navigation";
import Section from "./components/Section";

// ABIs
import CarrierApp from "./abis/CarrierApp.json";

// Config
import config from "./config.json";

const Search = () => {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [dailyHighlights, setDailyHighlights] = useState([]);
  const [cart, setCart] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    setCart(storedCart);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("shoppingCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        if (!window.ethereum) {
          setError("MetaMask is not installed");
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();

        if (!config[chainId]?.CarrierApp?.address) {
          setError(`Contract not deployed on network ${chainId}`);
          return;
        }

        const carrierApp = new ethers.Contract(
          config[chainId].CarrierApp.address,
          CarrierApp,
          provider
        );

        const items = [];
        let id = 1;
        while (true) {
          try {
            const item = await carrierApp.getProduct(id);
            const formattedItem = {
              id: item.product_id.toString(),
              name: item.name,
              category: item.category,
              image: item.image,
              cost: ethers.formatUnits(item.cost.toString(), "ether"),
              stock: item.stock.toString(),
              specification: {
                color: item.specs.color || "",
                engine_power: item.specs.engine_power || "",
                fuel: item.specs.fuel || "",
                interior: item.specs.interior || "",
                mileage: item.specs.mileage || "",
                condition: item.specs.condition || "",
                cubic_capacity: item.specs.cubic_capacity || "",
              },
              highlights: item.highlights,
            };
            console.log(`Formatted item ${id}:`, formattedItem);
            items.push(formattedItem);
            id++;
          } catch (err) {
            if (err.reason?.includes("ItemNotFound")) {
              break; // No more items
            }
            console.error(`Error fetching item ${id}:`, err);
            id++;
            if (id > 100) break; // Safety limit
          }
        }

        if (items.length === 0) {
          setError("No vehicles found in the contract");
        } else {
          setCars(items);
          setDailyHighlights(items.sort(() => Math.random() - 0.5).slice(0, 3));
        }
      } catch (error) {
        console.error("Error loading vehicles:", error);
        setError("Failed to load data from blockchain");
      } finally {
        setLoading(false);
      }
    };

    loadBlockchainData();
  }, []);

  useEffect(() => {
    const filtered = cars.filter((vehicle) =>
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

      {/* Error or Loading */}
      {loading ? (
        <p>Loading vehicles...</p>
      ) : error ? (
        <p className="error" style={{ color: "red", textAlign: "center" }}>
          {error}
        </p>
      ) : (
        <>
          {/* Featured Brands and Daily Highlights (when no search term) */}
          {searchTerm.trim() === "" && (
            <>
              <div className="featured-brands">
                <h3>Featured Brands</h3>
                <div className="brands-container">
                  <img src="/images/toyota.png" alt="Toyota" className="brand-logo" />
                  <img src="/images/honda.png" alt="Honda" className="brand-logo" />
                  <img src="/images/tesla.png" alt="Tesla" className="brand-logo" />
                </div>
              </div>

              <Section
                title={"Daily Highlights"}
                items={dailyHighlights}
                cart={cart}
                setCart={setCart}
              />
            </>
          )}

          {/* Search Results */}
          {searchTerm.trim() !== "" && (
            <Section
              title={"Search Results"}
              items={filteredCars}
              cart={cart}
              setCart={setCart}
            />
          )}
        </>
      )}

      <FooterNavigation />
    </div>
  );
};

export default Search;