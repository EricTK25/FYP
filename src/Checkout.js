import React, { useState, useEffect, useRef } from "react";
import { useEthereum } from "./EthereumContext";
import { useNavigate } from "react-router-dom";
import { parseUnits, formatEther } from "ethers";
import { useCart } from "./CartContext";
import Navigation from "./components/Navigation";
import FooterNavigation from "./components/FooterNavigation";
import CheckoutInfo from "./components/CheckOutInfo";
import { loadBlockchainData, buyHandler } from "./utils/blockchain";
import { generateAndStoreDocument } from "./utils/document";
import Gun from "gun";
import "./Checkout.css";

const Checkout = () => {
  const { account } = useEthereum();
  const { cart, setCart } = useCart();
  const navigate = useNavigate();
  const gunRef = useRef(Gun({ peers: [process.env.REACT_APP_GUN_PEER || "http://localhost:8765/gun"] }));
  const timeoutRef = useRef(null);
  const [transactionHash, setTransactionHash] = useState(null);
  const [hasBought, setHasBought] = useState(false);
  const [carrierapp, setCarrierApp] = useState(null);
  const [documentRegistry, setDocumentRegistry] = useState(null);
  const [provider, setProvider] = useState(null);
  const [notification, setNotification] = useState({ visible: false, message: "" });
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [documentCids, setDocumentCids] = useState([]);
  const [shippingAddress, setShippingAddress] = useState("");

  useEffect(() => {
    if (account) {
      const userNode = gunRef.current.get(`user_${account}`).get("profile");
      userNode.once((data) => {
        if (data) {
          setShippingAddress(data.shippingAddress || "");
        }
      });
      gunRef.current.get(`user_${account}`).get("cart").map().once((data, key) => {
        if (data) {
          setCart((prev) => {
            if (!prev.some((item) => item.id === data.id)) {
              return [...prev, data];
            }
            return prev;
          });
        }
      });
    }
  }, [account, setCart]);

  useEffect(() => {
    loadBlockchainData({ setProvider, setCarrierApp, setDocumentRegistry, setNotification });
    return () => gunRef.current?.off();
  }, []);

  const showNotification = (message) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setNotification({ visible: true, message });
    timeoutRef.current = setTimeout(() => {
      setNotification({ visible: false, message: "" });
    }, 5000);
  };

  const clearCart = () => {
    setCart([]);
    if (account && gunRef.current) {
      gunRef.current.get(`user_${account}`).get("cart").put(null);
    }
    showNotification("Cart cleared after successful purchase.");
    navigate("/order-history");
  };

  const handlePurchase = async () => {
    if (!carrierapp || !provider || !documentRegistry) {
      showNotification("Blockchain not initialized!");
      return;
    }
    if (!cart || cart.length === 0) {
      showNotification("Cart is empty!");
      return;
    }
    if (!account) {
      showNotification("Please connect your wallet!");
      return;
    }

    setIsPurchasing(true);
    console.log("Cart contents:", cart);

    try {
      const cids = [];
      for (const item of cart) {
        const productId = Number(item.id);
        if (!productId || isNaN(productId)) {
          throw new Error(`Invalid product ID: ${item.id}`);
        }

        let product;
        try {
          product = await carrierapp.getProduct(productId);
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

        if (costInWei.toString() !== contractCost.toString()) {
          throw new Error(
            `Cost mismatch for product ${productId}. Cart: ${cartCost} ETH, Contract: ${formatEther(contractCost)} ETH`
          );
        }

        console.log(`Purchasing product ${productId} for ${cartCost} ETH (${costInWei.toString()} Wei)`);
        const { transaction, orderId } = await buyHandler(productId, costInWei, provider, carrierapp);

        const highlights = Array.isArray(item.highlights)
          ? item.highlights.join(", ")
          : item.highlights ?? product.highlights ?? "N/A";

        const cid = await generateAndStoreDocument(
          transaction,
          productId,
          {
            ...item,
            specs: item.specification || product.specs,
            category: item.category || product.category,
            highlights,
            product_name: item.name,
          },
          orderId,
          account,
          provider,
          documentRegistry
        );
        if (cid) {
          cids.push({ productId, orderId, cid });
          if (account && gunRef.current) {
            const orderTime = new Date().toISOString(); // Use ISO string for consistency
            gunRef.current
              .get(`user_${account}`)
              .get("orders")
              .get(orderId.toString())
              .put({
                txHash: transaction.hash,
                orderTime,
                productId,
              });
            console.log(`Stored order ${orderId} with txHash ${transaction.hash} and orderTime ${orderTime} in GunDB`);
          }
        }
      }

      setTransactionHash(cids.length > 0 ? cids[cids.length - 1].cid : null);
      setDocumentCids(cids);
      setHasBought(true);

      showNotification("Purchase successful! Receipt downloaded locally.");
      clearCart();
    } catch (error) {
      console.error("Purchase failed:", error);
      showNotification(error.message || "Purchase failed. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="checkout-page">
      <Navigation />
      <h2>Checkout</h2>
      {!cart || cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <CheckoutInfo
          account={account}
          cart={cart}
          totalFee={cart.reduce((total, item) => total + parseFloat(item.cost || 0), 0)}
          isPurchasing={isPurchasing}
          handlePurchase={handlePurchase}
          transactionHash={transactionHash}
          documentCids={documentCids}
          hasBought={hasBought}
          shippingAddress={shippingAddress}
        />
      )}
      {notification.visible && (
        <div className="notification" role="alert" aria-live="polite">
          {notification.message}
        </div>
      )}
      <FooterNavigation />
    </div>
  );
};

export default Checkout;