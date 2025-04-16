import React, { useState, useEffect } from "react";
import { useEthereum } from "./EthereumContext";
import { useLocation, useNavigate } from "react-router-dom";
import { parseUnits, formatEther } from "ethers";
import Navigation from "./components/Navigation";
import FooterNavigation from "./components/FooterNavigation";
import CheckoutInfo from "./components/CheckOutInfo";
import { loadBlockchainData, buyHandler } from "./utils/blockchain";
import { generateAndStoreDocument } from "./utils/document";
import { clearCart } from "./utils/cart";
import "./Checkout.css";

const Checkout = () => {
  const { account } = useEthereum();
  const location = useLocation();
  const { cart } = location.state || {};
  const [transactionHash, setTransactionHash] = useState(null);
  const [hasBought, setHasBought] = useState(false);
  const [carrierapp, setCarrierApp] = useState(null);
  const [documentRegistry, setDocumentRegistry] = useState(null);
  const [provider, setProvider] = useState(null);
  const [notification, setNotification] = useState({ visible: false, message: "" });
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [documentCids, setDocumentCids] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadBlockchainData({ setProvider, setCarrierApp, setDocumentRegistry, setNotification });
  }, []);

  const handlePurchase = async () => {
    if (!carrierapp || !provider || !documentRegistry) {
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
      const cids = [];
      for (const item of cart) {
        const productId = Number(item.id);
        if (!productId || isNaN(productId)) {
          throw new Error(`Invalid product ID: ${item.id}`);
        }

        // Validate product existence and stock
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

        const cid = await generateAndStoreDocument(
          transaction,
          productId,
          {
            ...item,
            specs: item.specification || product.specs,
            category: item.category || product.category,
            highlights: item.highlights || product.highlights,
            product_name: item.name,
          },
          orderId,
          account,
          provider,
          documentRegistry
        );
        if (cid) {
          cids.push({ productId, orderId, cid });
        }
      }

      setTransactionHash(cids.length > 0 ? cids[cids.length - 1].cid : null);
      setDocumentCids(cids);
      setHasBought(true);

      setNotification({
        visible: true,
        message: "Purchase successful! Receipt downloaded locally.",
      });

      clearCart(account, navigate, setNotification);
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
        />
      )}
      {notification.visible && (
        <div className="notification">
          {notification.message}
        </div>
      )}
      <FooterNavigation />
    </div>
  );
};

export default Checkout;