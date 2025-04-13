import React, { useEffect, useState, useRef } from "react";
import Gun from "gun";
import { useEthereum } from "./EthereumContext";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

import FooterNavigation from "./components/FooterNavigation";
import Navigation from "./components/Navigation";

const Cart = ({ onRemoveFromCart, onCheckout }) => {
    const { account } = useEthereum();
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    const gunRef = useRef();
    if (!gunRef.current) {
        gunRef.current = Gun();
    }
    const gun = gunRef.current;

    useEffect(() => {
        if (!account) {
            setCart([]);
            return;
        }

        const userCartNode = gun.get(`user_${account}`).get("cart");
        const loadedItems = [];

        userCartNode.map().once((data, key) => {
            if (data === null) {
                return;
            }
            if (key && key.startsWith("item_") && data && data.id) {
                loadedItems.push(data);
                setCart([...loadedItems]);
            }
        });
    }, [account, gun]);

    const deleteSelectedItems = (selectedIds) => {
        const updatedCart = cart.filter((item) => !selectedIds.includes(item.id));
        setCart(updatedCart);

        if (account) {
            const userCartNode = gun.get(`user_${account}`).get("cart");

            if (updatedCart.length === 0) {
                userCartNode.put(null, (ack) => {
                    if (ack.err) {
                        console.error("Error deleting cart node in GunDB:", ack.err);
                    } else {
                        console.log(`Cart node removed for account ${account}.`);
                    }
                });
            } else {
                const updatedCartObject = updatedCart.reduce((obj, cartItem, index) => {
                    obj[`item_${index}`] = cartItem;
                    return obj;
                }, {});
                userCartNode.put(updatedCartObject, (ack) => {
                    if (ack.err) {
                        console.error("Error updating cart in GunDB:", ack.err);
                    } else {
                        console.log(
                            `Cart updated in GunDB for account ${account}:`,
                            updatedCartObject
                        );
                        userCartNode.once((oldData) => {
                            if (oldData && typeof oldData === "object") {
                                Object.keys(oldData).forEach((key) => {
                                    if (key === "_" || key === "#") return;
                                    if (!updatedCartObject.hasOwnProperty(key)) {
                                        userCartNode.get(key).put(null, (ack2) => {
                                            if (ack2 && ack2.err) {
                                                console.error(
                                                    `Error deleting key ${key} from GunDB:`,
                                                    ack2.err
                                                );
                                            } else {
                                                console.log(
                                                    `Deleted key ${key} from GunDB for account ${account}.`
                                                );
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    };

    const handleRemove = (itemId) => {
        deleteSelectedItems([itemId]);
        if (onRemoveFromCart) {
            onRemoveFromCart(itemId);
        }
    };

    const handleCheckout = () => {
        if (onCheckout) {
            onCheckout(cart);
        }
        setCart([]);
        if (account) {
            const userCartNode = gun.get(`user_${account}`).get("cart");
            userCartNode.put(null, (ack) => {
                if (ack.err) {
                    console.error("Error clearing cart in GunDB:", ack.err);

                }
                else {
                    console.log(`Cart node cleared in GunDB for account ${account}.`);
                }
            });
        }

        navigate("/checkout", { state: { cart } });
    };



    return (
        <div>
            <Navigation />
            <div className="cart-page">
                <h2>Your Shopping Cart ({cart.length} Items)</h2>
                {cart.length === 0 ? (
                    <p>Your cart is empty. Add some products to continue!</p>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items">
                            {cart.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="cart-item">
                                    <img src={item.image} alt={item.product_name || item.name} className="cart-item__image" />
                                    <div className="cart-item__info">
                                        <h4>{item.product_name || item.name}</h4>
                                        <p>{item.cost}</p>
                                    </div>
                                    <button
                                        className="remove-item"
                                        onClick={() => handleRemove(item.id)}
                                    >
                                        REMOVE FROM CART
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="summary-box">
                            <p>Subtotal: ${cart.reduce((total, item) => total + parseFloat(item.cost), 0).toFixed(2)}</p>
                            <label>
                                <input type="checkbox" /> I agree to terms and refund policy
                            </label>
                            <button className="checkout-button" onClick={handleCheckout}>
                                PROCEED TO CHECKOUT
                            </button>
                        </div>

                    </div>
                )}
            </div>
            <FooterNavigation />
        </div>
    );
};

export default Cart;
