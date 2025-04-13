import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import Gun from "gun";
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
  const [cars, setCar] = useState([]); 
  const [cart, setCart] = useState([]); 
  const gunRef = useRef(); 

  if (!gunRef.current) {
    gunRef.current = Gun();
  }
  const gun = gunRef.current;

  // Load cart data from GunDB when the wallet connects
  useEffect(() => {
    if (account) {
      const userNode = gun.get(`user_${account}`);
      userNode.get("cart").once((cartData) => {
        if (cartData) {
          const cartArray = Object.keys(cartData)
            .filter((key) => key.startsWith("item_"))
            .map((key) => cartData[key]);
          setCart(cartArray);
          console.log(`Loaded cart for account ${account}:`, cartArray);
        } else {
          console.log(`No cart data found for account ${account}. Initializing an empty cart.`);
          setCart([]);
        }
      });
    }
  }, [account, gun]);

  // Load blockchain data (vehicles and metadata)
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
