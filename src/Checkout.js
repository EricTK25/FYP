import React, { useState, useEffect } from "react";
import { useEthereum } from "./EthereumContext";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { parseUnits } from "ethers"; 
import CarrierApp from './abis/CarrierApp.json';
import { ethers } from 'ethers';
import config from './config.json';
import "./Checkout.css";
import Gun from "gun";

const gun = Gun();

const Checkout = () => {
    const { account } = useEthereum();
    const location = useLocation();
    const { cart } = location.state || {};
    const [transactionHash, setTransactionHash] = useState(null);
    const [hasBought, setHasBought] = useState(false);
    const [carrierapp, setCarrierApp] = useState(null);
    const [provider, setProvider] = useState(null);
    const [notification, setNotification] = useState({ visible: false, message: '' });
    const navigate = useNavigate();

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

    const buyHandler = async (product_id, cost) => {
        const signer = await provider.getSigner();
        let transaction = await carrierapp.connect(signer).buy(product_id, { value: cost });
        await transaction.wait();
        setTransactionHash(transaction.hash);
        setHasBought(true);
    };

    const handlePurchase = async () => {
        try {
            for (const item of cart) {
                const costInWei = parseUnits(item.cost, "ether").toString();
                await buyHandler(item.id, costInWei);
            }
            setNotification({ visible: true, message: 'Purchase successful!' });
            clearCart();
        } catch (error) {
            console.error("Purchase failed", error);
            setNotification({ visible: true, message: 'Purchase failed. Please try again.' });
        } finally {
            setTimeout(() => {
                setNotification({ visible: false, message: '' });
            }, 3000); // Hide notification after 3 seconds
        }
    };

    const clearCart = () => {
        if (account) {
            const userCartNode = gun.get(`user_${account}`).get("cart");
            userCartNode.put(null, (ack) => {
                if (ack.err) {
                    console.error("Error clearing cart in GunDB:", ack.err);
                } else {
                    console.log(`Cart node cleared in GunDB for account ${account}.`);
                }
            });
        }
        navigate("/");
    };

    const totalFee = cart.reduce((total, item) => total + parseFloat(item.cost), 0);

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
                <p>{totalFee.toFixed(2)} ETH</p>
                <button onClick={handlePurchase}>Purchase with MetaMask</button>
                {transactionHash && <p>Transaction Hash: {transactionHash}</p>}
                {hasBought && <p>Purchase successful!</p>}
            </div>
            {notification.visible && (
                <div className='notification'>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default Checkout;
