import React, { useState, useEffect } from "react";
import { useEthereum } from "./EthereumContext";
import { useLocation } from "react-router-dom";
import { parseUnits } from "ethers"; 
import "./Checkout.css";

const Checkout = () => {
    const { provider, contract, account } = useEthereum();
    const location = useLocation();
    const { cart } = location.state || {};
    const [transactionHash, setTransactionHash] = useState(null);
    const [hasBought, setHasBought] = useState(false);

    useEffect(() => {
        if (hasBought) {
            fetchDetails();
        }
    }, [hasBought]);

    const fetchDetails = async () => {
        if (!contract) {
            console.error("Contract instance is not defined");
            return;
        }

        const events = await contract.queryFilter("Buy");
        const orders = events.filter(
            (event) => event.args.buyer === account && cart.some(item => item.id.toString() === event.args.itemId.toString())
        );

        if (orders.length === 0) return;

        const orderDetails = await Promise.all(
            orders.map(async (order) => {
                return await contract.orders(account, order.args.orderId);
            })
        );

        console.log(orderDetails);
    };

    const buyHandler = async (product_id, cost) => {
        try {
            const signer = await provider.getSigner();
            let transaction = await contract.connect(signer).buy(product_id, { value: cost });
            await transaction.wait();
            setTransactionHash(transaction.hash);
            setHasBought(true);
        } catch (error) {
            console.error("Transaction failed", error);
        }
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
