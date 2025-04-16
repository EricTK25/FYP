import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import Gun from "gun";
import { useEthereum } from "./EthereumContext";
import CarrierApp from "./abis/CarrierApp.json";
import Navigation from "./components/Navigation";
import Section from "./components/Section";
import FooterNavigation from "./components/FooterNavigation";
import HeroSection from "./components/HeroSection";
import config from "./config.json";
import "./App.css";

const Buy = () => {
  const { account, contextcars, setContextcars } = useEthereum();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);

  const gunRef = useRef(null);
  if (!gunRef.current) {
    gunRef.current = Gun();
  }
  const gun = gunRef.current;

  const loadBlockchainData = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      //setProvider(provider);
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
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 10; // Increased to handle sparse IDs
      const maxId = 1000; // Safety limit to prevent infinite loop
      while (consecutiveErrors < maxConsecutiveErrors && id <= maxId) {
        console.log(`Attempting to fetch item ID ${id}`);
        try {
          const item = await carrierapp.getItemDetails(id);
          console.log(item)
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
              cubic_capacity: item.specs.cubic_capacity
            },
            highlights: item.highlights,
            seller: item.seller
          });
          console.log(`Fetched item ${id}: ${item.name}`);
          consecutiveErrors = 0;
          id++;
        } catch (innerError) {
          if (innerError.reason?.includes("ItemNotFound") || innerError.data?.startsWith("0x1910c897")) {
            console.log(`Item ${id} not found`);
            consecutiveErrors++;
          } else {
            console.error(`Unexpected error fetching item ${id}:`, innerError.message, innerError.data);
          }
          id++;
        }
      }
  
      setCars(items);
      if(contextcars===null){
        setContextcars(items);
      }
    } catch (error) {
      console.error("Error loading blockchain data:", error);
      //setError("Failed to load data from blockchain");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div className="App">
      <Navigation />
      <HeroSection />
      <h2>Vehicle App Best Sellers</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Section title={"Cars"} items={cars} cart={cart} setCart={setCart} />
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}
      <FooterNavigation />
    </div>
  );
};

export default Buy;