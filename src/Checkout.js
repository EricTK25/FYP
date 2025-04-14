import React, { useState, useEffect } from "react";
import { useEthereum } from "./EthereumContext";
import { useLocation } from "react-router-dom";
import { parseUnits } from "ethers"; 
import CarrierApp from './abis/CarrierApp.json';
import { ethers } from 'ethers';
import config from './config.json';
import "./Checkout.css";

const Checkout = () => {
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
};

export default Checkout;
