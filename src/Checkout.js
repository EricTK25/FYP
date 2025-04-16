import React, { useState, useEffect } from "react";
import { useEthereum } from "./EthereumContext";
<<<<<<< Updated upstream
import { useLocation } from "react-router-dom";
import { parseUnits } from "ethers"; 
import CarrierApp from './abis/CarrierApp.json';
import { ethers } from 'ethers';
import config from './config.json';
=======
import { useLocation, useNavigate } from "react-router-dom";
import { parseUnits, formatEther } from "ethers";
import Navigation from "./components/Navigation";
import FooterNavigation from "./components/FooterNavigation";
import CheckoutInfo from "./components/CheckOutInfo";
import { loadBlockchainData, buyHandler } from "./utils/blockchain";
import { generateAndStoreDocument } from "./utils/document";
import { clearCart } from "./utils/cart";
import Gun from 'gun';
>>>>>>> Stashed changes
import "./Checkout.css";

const gun = Gun();
const Checkout = () => {
<<<<<<< Updated upstream
    const {contract, account } = useEthereum();
    const location = useLocation();
    const { cart } = location.state || {};
    const [transactionHash, setTransactionHash] = useState(null);
    const [hasBought, setHasBought] = useState(false);
    const [carrierapp, setCarrierApp] = useState(null);
    const [provider, setProvider] = useState(null);

   useEffect(() => {
       const loadBlockchainData = async () => {
         const provider = new ethers.BrowserProvider(window.ethereum);
         const network = await provider.getNetwork();
         const carrierapp = new ethers.Contract(
           config[network.chainId].CarrierApp.address,
           CarrierApp,
           provider
         );
   
         setProvider(provider);
         setCarrierApp(carrierapp);
       };
   
       loadBlockchainData();
     }, []);
=======
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
  const [shippingAddress, setShippingAddress] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (account) {
      const userNode = gun.get(`user_${account}`).get('profile');
      userNode.once((data) => {
        if (data) {
          setShippingAddress(data.shippingAddress);
        }
      });
    }
  }, [account]);

  useEffect(() => {
    loadBlockchainData({ setProvider, setCarrierApp, setDocumentRegistry, setNotification });
  }, []);
>>>>>>> Stashed changes

     const buyHandler = async (product_id, cost) => {
        const signer = await provider.getSigner();
    
        let transaction = await carrierapp.connect(signer).buy(product_id, { value: cost });
        await transaction.wait();
      };
    

    const handlePurchase = async () => {
        try {
            for (const item of cart) {
                const costInWei = parseUnits(item.cost, "ether").toString();
                await buyHandler(item.id, costInWei);
            }
        } catch (error) {
            console.error("Purchase failed", error);
        }
    };

<<<<<<< Updated upstream
    return (
        <div className="checkout-page">
            <h2>Checkout</h2>
            <div className="checkout-info">
                <h3>Delivery Address</h3>
                <p>{account}</p>
                <h3>Cart Items</h3>
                {cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="checkout-item">
                        <img src={item.image} alt={item.product_name || item.name} className="checkout-item__image" />
                        <div className="checkout-item__info">
                            <h4>{item.product_name || item.name}</h4>
                            <p>{item.cost}</p>
                        </div>
                    </div>
                ))}
                <h3>Total Fee</h3>
                {/* <p>${totalFee.toFixed(2)}</p> */}
                <button onClick={handlePurchase}>Purchase with MetaMask</button>
                {transactionHash && <p>Transaction Hash: {transactionHash}</p>}
                {hasBought && <p>Purchase successful!</p>}
            </div>
        </div>
    );
=======
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
    <div><Navigation />
    <div className="checkout-page">
    <div className="checkout-container">
      <h2>Checkout ({cart.length} Item{cart.length !== 1 ? "s" : ""})</h2>
      {!cart || cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="checkout-info">
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
        </div>
      
      )}
      </div>
      {notification.visible && (
        <div className="notification">
          {notification.message}
        </div>
      )}
      
    </div>
    <FooterNavigation />
    </div>
  );
>>>>>>> Stashed changes
};

export default Checkout;
