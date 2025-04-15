import React, { useState, useEffect } from "react";
import { useEthereum } from "./EthereumContext";
import { useLocation, useNavigate } from "react-router-dom";
import { parseUnits, formatEther } from "ethers";
import CarrierApp from "./abis/CarrierApp.json";
import { ethers } from "ethers";
import config from "./config.json";
import "./Checkout.css";
import Gun from "gun";
// Components
import FooterNavigation from "./components/FooterNavigation";
import Navigation from "./components/Navigation";
const gun = Gun();

const Checkout = () => {
  const { account } = useEthereum();
  const location = useLocation();
  const { cart } = location.state || {};
  const [transactionHash, setTransactionHash] = useState(null);
  const [hasBought, setHasBought] = useState(false);
  const [carrierapp, setCarrierApp] = useState(null);
  const [provider, setProvider] = useState(null);
  const [notification, setNotification] = useState({ visible: false, message: "" });
  const [isPurchasing, setIsPurchasing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (!window.ethereum) {
        setNotification({ visible: true, message: "MetaMask is not installed!" });
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();
        if (!config[chainId]?.CarrierApp?.address) {
          setNotification({ visible: true, message: "Unsupported network!" });
          return;
        }

        const carrierapp = new ethers.Contract(
          config[chainId].CarrierApp.address,
          CarrierApp,
          provider
        );

        setProvider(provider);
        setCarrierApp(carrierapp);

        // Debug: Log contract address and network
        console.log("Network chainId:", chainId);
        console.log("Contract address:", config[chainId].CarrierApp.address);
      } catch (error) {
        console.error("Error loading blockchain data:", error);
        setNotification({ visible: true, message: "Failed to connect to blockchain." });
      }
    };

    loadBlockchainData();
  }, []);

  const buyHandler = async (product_id, cost) => {
    try {
      const signer = await provider.getSigner();
      // Estimate gas to catch errors early
      const estimatedGas = await carrierapp
        .connect(signer)
        .buy.estimateGas(product_id, { value: cost });
      console.log(`Estimated gas for product ${product_id}:`, estimatedGas.toString());

      const transaction = await carrierapp
        .connect(signer)
        .buy(product_id, { value: cost, gasLimit: estimatedGas * 120n / 100n });
      const receipt = await transaction.wait();
      console.log(`Transaction confirmed: ${transaction.hash}`);
      setTransactionHash(transaction.hash);
      setHasBought(true);
      return receipt;
    } catch (error) {
      console.error(`buyHandler error for product ${product_id}:`, error);
      let message = "Purchase failed.";
      if (error.data?.data?.includes("8ac72035")) {
        message = `Product ID ${product_id} does not exist.`;
      } else if (error.data?.data?.includes("c90ae29f")) {
        message = `Product ID ${product_id} is out of stock.`;
      } else if (error.data?.data?.includes("f4c5f6b6")) {
        const required = await carrierapp.getProduct(product_id).then(p => p.cost.toString());
        message = `Insufficient payment for product ${product_id}. Sent: ${formatEther(cost)} ETH, Required: ${formatEther(required)} ETH.`;
      } else if (error.message.includes("insufficient funds")) {
        message = "Insufficient ETH in your wallet.";
      } else if (error.message.includes("user rejected")) {
        message = "Transaction rejected by user.";
      }
      throw new Error(message);
    }
  };

  const handlePurchase = async () => {
    if (!carrierapp || !provider) {
      setNotification({ visible: true, message: "Blockchain not initialized!" });
      return;
    }
    if (!cart || cart.length === 0) {
      setNotification({ visible: true, message: "Cart is empty!" });
      return;
    }
    if (!account) {
      setNotification({ visible: true, message: "Please connect your wallet!" });
      return;
    }

    setIsPurchasing(true);
    console.log("Cart contents:", cart);

    try {
      for (const item of cart) {
        const productId = Number(item.id);
        if (!productId || isNaN(productId)) {
          throw new Error(`Invalid product ID: ${item.id}`);
        }

        // Validate product exists and matches cost
        let product;
        try {
          product = await carrierapp.getProduct(productId);
          console.log(`Product ${productId} data:`, {
            name: product.name,
            cost: formatEther(product.cost),
            stock: product.stock.toString(),
          });
        } catch (error) {
          throw new Error(`Product ID ${productId} does not exist in contract.`);
        }

        if (product.stock === 0) {
          throw new Error(`Product ID ${productId} is out of stock.`);
        }

        const cartCost = String(item.cost);
        if (!cartCost || isNaN(parseFloat(cartCost))) {
          throw new Error(`Invalid cost for product ${productId}`);
        }
        const costInWei = parseUnits(cartCost, "ether");
        const contractCost = product.cost;

        if (costInWei !== contractCost) {
          throw new Error(
            `Cost mismatch for product ${productId}. Cart: ${cartCost} ETH, Contract: ${formatEther(contractCost)} ETH`
          );
        }

        console.log(`Purchasing product ${productId} for ${cartCost} ETH (${costInWei.toString()} Wei)`);
        await buyHandler(productId, costInWei);
      }

      setNotification({ visible: true, message: "Purchase successful!" });
      clearCart();
    } catch (error) {
      console.error("Purchase failed:", error);
      setNotification({ visible: true, message: error.message || "Purchase failed. Please try again." });
    } finally {
      setIsPurchasing(false);
      setTimeout(() => {
        setNotification({ visible: false, message: "" });
      }, 5000);
    }
  };

  const clearCart = () => {
    if (account) {
      const userCartNode = gun.get(`user_${account}`).get("cart");
      userCartNode.put(null, (ack) => {
        if (ack.err) {
          console.error("Error clearing cart in GunDB:", ack.err);
          setNotification({ visible: true, message: "Failed to clear cart in database." });
        } else {
          console.log(`Cart cleared for account ${account}`);
        }
      });
    }
    navigate("/");
  };

  const totalFee = cart?.reduce((total, item) => total + parseFloat(item.cost || 0), 0) || 0;

  return (
    <div className="checkout-page">
    <Navigation/>
      <h2>Checkout</h2>
      {!cart || cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="checkout-info">
          <h3>Delivery Address</h3>
          <p>{account || "No wallet connected"}</p>
          <h3>Cart Items</h3>
          {cart.map((item, index) => (
            <div key={`${item.id}-${index}`} className="checkout-item">
              <img src={item.image} alt={item.product_name || item.name} className="checkout-item__image" />
              <div className="checkout-item__info">
                <h4>{item.product_name || item.name}</h4>
                <p>{item.cost} ETH</p>
              </div>
            </div>
          ))}
          <h3>Total Fee</h3>
          <p>{totalFee.toFixed(2)} ETH</p>
          <button onClick={handlePurchase} disabled={isPurchasing || !account || !cart?.length}>
            {isPurchasing ? "Processing..." : "Purchase with MetaMask"}
          </button>
          {transactionHash && <p>Transaction Hash: {transactionHash}</p>}
          {hasBought && <p>Purchase successful!</p>}
        </div>
      )}
      {notification.visible && (
        <div className="notification">
          {notification.message}
        </div>
      )}
      <FooterNavigation/>
    </div>
  );
};

export default Checkout;