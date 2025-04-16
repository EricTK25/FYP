import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useEthereum } from "./EthereumContext"; // Import EthereumContext globally

// ABIs
import CarrierApp from "./abis/CarrierApp.json";

// Components
import Navigation from "./components/Navigation";
import Section from "./components/Section";
import FooterNavigation from "./components/FooterNavigation";
import HeroSection from "./components/HeroSection";

// Config
import config from "./config.json";

const Buy = () => {
  const { account, contextcars, setContextcars } = useEthereum();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);

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
  
      const carrierapp = new ethers.Contract(
        config[chainId].CarrierApp.address,
        CarrierApp,
        provider
      );
  
      const latestBlock = await provider.getBlockNumber();
      console.log("Latest block number before fetching items:", latestBlock);
  
      const items = [];
      let id = 1;
      while (true) {
        try {
          const item = await carrierapp.getProduct(id);
          items.push({
            id: item.product_id.toString(),
            name: item.name,
            category: item.category,
            image: item.image,
            cost: ethers.formatUnits(item.cost.toString(), "ether"),
            stock: item.stock.toString(),
            specification: {
              color: item.specs.color,
              engine_power: item.specs.engine_power,
              fuel: item.specs.fuel,
              interior: item.specs.interior,
              mileage: item.specs.mileage,
              condition: item.specs.condition,
              cubic_capacity: item.specs.cubic_capacity,
            },
            highlights: item.highlights,
          });
          id++;
        } catch (innerError) {
          if (innerError.code === 'CALL_EXCEPTION' && !innerError.data) {
            console.log(`Item ${id} not found in contract.`);
            break; // Stop when no more items exist
          } else if (innerError.errorName === 'ItemNotFound') {
            console.log(`Item ${id} does not exist.`);
            break; // Stop when no more items exist
          } else {
            console.error(`Error fetching item ${id}:`, innerError);
            id++;
            if (id > 100) break; // Safety limit to prevent infinite loops
          }
        }
      }
  
      if (items.length === 0) {
        setError("No items found in the contract");
      } else {
        setCars(items);
        setContextcars(items); // Sync with global context
      }
    } catch (error) {
      console.error("Error loading blockchain data:", error);
      setError("Failed to load data from blockchain");
    } finally {
      setLoading(false);
    }
  };

  // Load blockchain data on component mount
  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <Navigation />
      <HeroSection />
      <h2>Vehicle App Best Sellers</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Section
          title={"Cars"}
          items={cars}
          cart={cart}
          setCart={setCart}
        />
      )}
      <FooterNavigation />
    </div>
  );
}

export default Buy;
