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
  const { account } = useEthereum();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [cart, setCart] = useState([]);

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
        try {
          const item = await carrierApp.items(i + 1);
          items.push({
            id: item.product_id.toString(),
            name: item.product_name,
            category: item.product_category,
            image: item.product_image,
            cost: ethers.formatUnits(item.cost.toString(), "ether"),
            stock: item.stock.toString(),
            specification: item.specification,
            highlights: item.highlights
          });
        } catch (innerError) {
          console.error(`Error processing item ${i + 1}:`, innerError);
        }
      }
      setCars(items);
    } catch (error) {
      console.error("Error in loading blockchain data:", error);
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
