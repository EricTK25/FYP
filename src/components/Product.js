import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import CarrierApp from "../abis/CarrierApp.json";
import config from "../config.json";
import Navigation from "./Navigation";
import FooterNavigation from "./FooterNavigation";
import "../App.css";

function ProductDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, name, cost, image, stock, specification, highlights } = location.state || {};
  const [carrierapp, setCarrierApp] = useState(null);
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ visible: false, message: "" });
  const [isBuying, setIsBuying] = useState(false);
  const [itemData, setItemData] = useState(null);
  const [order, setOrder] = useState(null);
  const [hasBought, setHasBought] = useState(false);

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        if (!window.ethereum) {
          setError("MetaMask is not installed");
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
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

        setProvider(provider);
        setCarrierApp(carrierapp);

        if (id) {
          try {
            const item = await carrierapp.getProduct(id);
            const specs = item.specs;
            console.log("Fetched item specification:", specs);
            setItemData({
              id: item.product_id.toString(),
              name: item.name,
              cost: ethers.formatUnits(item.cost.toString(), "ether"),
              image: item.image,
              stock: item.stock.toString(),
              specification: {
                color: specs.color || "",
                engine_power: specs.engine_power || "",
                fuel: specs.fuel || "",
                interior: specs.interior || "",
                mileage: specs.mileage || "",
                condition: specs.condition || "",
                cubic_capacity: specs.cubic_capacity || "",
              },
              highlights: item.highlights,
            });
          } catch (err) {
            console.error("Error fetching item:", err);
            setError("Failed to load item details from blockchain");
          }
        }
      } catch (err) {
        console.error("Error loading blockchain data:", err);
        setError("Failed to connect to blockchain");
      }
    };

    loadBlockchainData();
  }, [id]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!carrierapp || !window.ethereum.selectedAddress) {
        console.error("Carrier app or account not defined");
        return;
      }

      const account = window.ethereum.selectedAddress;
      try {
        const events = await carrierapp.queryFilter("Buy");
        const orders = events.filter(
          (event) =>
            event.args.buyer.toLowerCase() === account.toLowerCase() &&
            event.args.itemId.toString() === id.toString()
        );

        if (orders.length === 0) return;

        const order = await carrierapp.orders(account, orders[0].args.orderId);
        setOrder(order);
      } catch (err) {
        console.error("Error fetching order details:", err);
      }
    };

    fetchDetails();
  }, [carrierapp, id, hasBought]);

  const handleBuy = async () => {
    if (!carrierapp || !provider) {
      setNotification({ visible: true, message: "Blockchain not initialized" });
      return;
    }
    if (!window.ethereum.selectedAddress) {
      setNotification({ visible: true, message: "Please connect your wallet" });
      return;
    }
    if ((itemData?.stock || stock) === "0") {
      setNotification({ visible: true, message: "Item out of stock" });
      return;
    }

    setIsBuying(true);
    try {
      const signer = await provider.getSigner();
      const contractWithSigner = carrierapp.connect(signer);
      const tx = await contractWithSigner.buy(id, {
        value: ethers.parseEther(itemData?.cost || cost),
      });
      await tx.wait();
      setHasBought(true);
      setNotification({ visible: true, message: `Successfully purchased ${name}!` });
      setTimeout(() => navigate("/buy"), 3000);
    } catch (err) {
      console.error("Purchase error:", err);
      setNotification({ visible: true, message: "Purchase failed: " + (err.reason || err.message) });
    } finally {
      setIsBuying(false);
      setTimeout(() => setNotification({ visible: false, message: "" }), 3000);
    }
  };

  const displayData = itemData || { id, name, cost, image, stock, specification, highlights };

  if (!displayData.id) {
    return (
      <div>
        <Navigation />
        <div className="product-detail">
          <h2>Product Not Found</h2>
          <p>Please select a product from the main page.</p>
        </div>
        <FooterNavigation />
      </div>
    );
  }

  return (
    <div>
      <div className="product-detail">
        <Navigation />
        <div className="product-container">
          <h2>{displayData.name || "Unnamed Vehicle"}</h2>
          {error && <p className="error" style={{ color: "red" }}>{error}</p>}
          <div className="product-image">
            <img
              src={displayData.image || "/images/placeholder.png"}
              alt={displayData.name || "Vehicle"}
              onError={(e) => (e.target.src = "/images/placeholder.png")}
            />
          </div>
          <div className="product-info">
            <p className="cost">Price: {displayData.cost} ETH</p>
            <p className="stock">Stock: {displayData.stock} available</p>
            <div className="vehicle-specifications">
              <h3>Vehicle Specifications</h3>
              {displayData.specification ? (
                <ul>
                  <li>Color: {displayData.specification.color || "Unknown"}</li>
                  <li>Engine Power: {displayData.specification.engine_power || "Unknown"}</li>
                  <li>Fuel: {displayData.specification.fuel || "Unknown"}</li>
                  <li>Interior: {displayData.specification.interior || "Unknown"}</li>
                  <li>Mileage: {displayData.specification.mileage || "Unknown"}</li>
                  <li>Condition: {displayData.specification.condition || "Unknown"}</li>
                  <li>Cubic Capacity: {displayData.specification.cubic_capacity || "Unknown"}</li>
                </ul>
              ) : (
                <p>Specifications not available</p>
              )}
            </div>
            <div className="highlights">
              <h3>Highlights</h3>
              {displayData.highlights ? (
                <p>{displayData.highlights}</p>
              ) : (
                <p>No highlights available</p>
              )}
            </div>
            <button
              className="buy-button"
              onClick={handleBuy}
              disabled={isBuying || (displayData.stock === "0")}
            >
              {isBuying ? "Processing..." : "Buy Now"}
            </button>
          </div>
          <button
            className="buy-button"
            onClick={handleBuy}
            disabled={isBuying || displayData.stock === "0"}
          >
            {isBuying ? "Processing..." : "Buy Now"}
          </button>
        </div>
      </div>
      {notification.visible && (
        <div className="notification" role="alert">
          {notification.message}
        </div>
      )}
      <FooterNavigation />
    </div>
  );
}

export default ProductDetail;