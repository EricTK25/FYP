import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Gun from "gun";
import { useEthereum } from "../EthereumContext";
import "../App.css";

const Section = ({ title, items, cart, setCart }) => {
    const { account, contextcars } = useEthereum();
    const navigate = useNavigate();
    const gunRef = useRef(null);
    const [notification, setNotification] = useState({ visible: false, message: "" });

    useEffect(() => {
        if (!gunRef.current) {
            gunRef.current = Gun({ peers: ["http://localhost:8765/gun"] });
        }
        return () => {
            // Cleanup Gun.js instance on unmount
            if (gunRef.current) {
                gunRef.current.off();
            }
        };
    }, []);

    const onAddToCart = (item) => {
        if (!account) {
            setNotification({
                visible: true,
                message: "Please connect your wallet to add items to the cart.",
            });
            setTimeout(() => setNotification({ visible: false, message: "" }), 3000);
            return;
        }

        setCart((prevCart) => {
            const cartItem = {
                id: item.id,
                name: item.name,
                cost: item.cost,
                image: item.image,
            }; // Store minimal data
            const updatedCart = [...prevCart, cartItem];
            const userNode = gunRef.current.get(`user_${account}`);
            const cartObject = updatedCart.reduce((obj, cartItem, index) => {
                obj[`item_${index}`] = cartItem;
                return obj;
            }, {});

            userNode.get("cart").put(cartObject, (ack) => {
                if (ack.err) {
                    console.error(`Error saving cart for account ${account}:`, ack.err);
                    setNotification({
                        visible: true,
                        message: "Failed to save cart. Please try again.",
                    });
                    setTimeout(() => setNotification({ visible: false, message: "" }), 3000);
                } else {
                    console.log(`Cart saved for account ${account}:`, cartObject);
                    setNotification({
                        visible: true,
                        message: `${item.name} added to cart!`,
                    });
                    setTimeout(() => setNotification({ visible: false, message: "" }), 3000);
                }
            });

            return updatedCart;
        });
    };

    const handleCardClick = (item) => {
        navigate(`/product/${item.id}`, {
            state: {
                id: item.id,
                name: item.name,
                cost: item.cost,
                image: item.image,
                stock: item.stock,
                specification: item.specification,
                highlights: item.highlights,
            },
        });
    };

    return (
        <div className="cards__section">
            <h2>{title}</h2>
            {items.length === 0 ? (
                <p>No vehicles available.</p>
            ) : (
                <div className="cards">
                    {items.map((item) => (
                        <div
                            className="card"
                            key={item.id}
                            onClick={() => handleCardClick(item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && handleCardClick(item)}
                        >
                            <div className="card__image">
                                <img
                                    src={item.image || "/images/placeholder.png"}
                                    alt={item.name || "Vehicle"}
                                    onError={(e) => (e.target.src = "/images/placeholder.png")}
                                />
                            </div>
                            <div className="card__info">
                                <h4>{item.name || "Unnamed Vehicle"}</h4>
                                <p>{item.cost} ETH</p>
                                <button
                                    className="add-to-cart"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToCart(item);
                                    }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {notification.visible && (
                <div className="notification" role="alert">
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default Section;