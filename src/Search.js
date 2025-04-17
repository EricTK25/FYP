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

  // Load blockchain data
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
            console.log(`Raw item ${id}:`, item);
            if (!item.name || item.name.trim() === "") {
              console.warn(`Skipping item ${id} due to missing name`);
              id++;
              continue;
            }
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
          setFilteredCars(items); // Initialize filteredCars
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

  // Filter cars based on search term
  useEffect(() => {
    console.log("Search term:", searchTerm);
    console.log("Cars:", cars);
    const filtered = cars.filter((vehicle) => {
      if (!vehicle.name || vehicle.name.trim() === "") {
        console.warn(`Vehicle with ID ${vehicle.id} has no name`);
        return false;
      }
      return vehicle.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    console.log("Filtered cars:", filtered);
    setFilteredCars(filtered);
  }, [searchTerm, cars]);

  const handleSearchChange = (event) => {
    console.log("Input value:", event.target.value);
    setSearchTerm(event.target.value);
  };

  // Handle brand logo click
  const handleBrandClick = (brandName) => {
    console.log("Brand clicked:", brandName);
    setSearchTerm(brandName);
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
                  <img
                    src="toyota.png"
                    alt="Toyota"
                    className="brand-logo"
                    onClick={() => handleBrandClick("Toyota")}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src="honda.png"
                    alt="Honda"
                    className="brand-logo"
                    onClick={() => handleBrandClick("Honda")}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src="tesla.png"
                    alt="Tesla"
                    className="brand-logo"
                    onClick={() => handleBrandClick("Tesla")}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src="Audi.png"
                    alt="Audi"
                    className="brand-logo"
                    onClick={() => handleBrandClick("Audi")}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src="BMW.webp"
                    alt="BMW"
                    className="brand-logo"
                    onClick={() => handleBrandClick("BMW")}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src="DaeWoo.png"
                    alt="DaeWoo"
                    className="brand-logo"
                    onClick={() => handleBrandClick("DaeWoo")}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src="Ford.jpeg"
                    alt="Ford"
                    className="brand-logo"
                    onClick={() => handleBrandClick("Ford")}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src="Holden.png"
                    alt="Holden"
                    className="brand-logo"
                    onClick={() => handleBrandClick("Holden")}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src="jaguar.jpg"
                    alt="Jaguar"
                    className="brand-logo"
                    onClick={() => handleBrandClick("Jaguar")}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </div>
              <div className="watercrafts-ships">
                <h3>WaterCrafts / Ships</h3>
                <div className="brands-container">
                  <img
                    src="Kawasaki.png"
                    alt="Kawasaki"
                    className="brand-logo"
                    onClick={() => handleBrandClick("Kawasaki")}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src="yamaha.jpg"
                    alt="Yamaha"
                    className="brand-logo"
                    onClick={() => handleBrandClick("Yamaha")}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src="cosco.png"
                    alt="Cosco"
                    className="brand-logo"
                    onClick={() => handleBrandClick("Cosco")}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </div>
              <div className="planes">
                <h3>Planes</h3>
                <div className="brands-container">
                  <img
                    src="cirrus.png"
                    alt="Cirrus"
                    className="brand-logo"
                    onClick={() => handleBrandClick("Cirrus")}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src="Bombardier.png"
                    alt="Bombardier"
                    className="brand-logo"
                    onClick={() => handleBrandClick("Bombardier")}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src="Embraer.png"
                    alt="Embraer"
                    className="brand-logo"
                    onClick={() => handleBrandClick("Embraer")}
                    style={{ cursor: "pointer" }}
                  />
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