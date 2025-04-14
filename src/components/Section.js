import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Gun from "gun";
import { useEthereum } from "../EthereumContext";
import { formatUnits } from "ethers"; // Import formatUnits from ethers
import "../App.css";

const Section = ({ title, items, cart, setCart }) => {
    const { account } = useEthereum();
    const navigate = useNavigate();
    const gunRef = useRef(Gun());
    const [notification, setNotification] = useState({ visible: false, message: '' });

    useEffect(() => {
        if (!gunRef.current) {
            gunRef.current = Gun();
        }
    }, []);

    const gun = gunRef.current;

    const onAddToCart = (item) => {
        if (!account) {
            alert("Please connect your wallet before adding items to the cart.");
            return;
        }
        setCart((prevCart) => {
            const cleanItem = JSON.parse(JSON.stringify(item));
            const updatedCart = [...prevCart, cleanItem];
            const userNode = gun.get(`user_${account}`);
            const cartObject = updatedCart.reduce((obj, cartItem, index) => {
                obj[`item_${index}`] = cartItem;
                return obj;
            }, {});
            userNode.get("cart").put(cartObject, (ack) => {
                if (ack.err) {
                    console.error(`Error saving cart to GunDB for account ${account}:`, ack.err);
                    alert("Failed to save cart. Please try again.");
                } else {
                    console.log(`Cart successfully saved for account ${account}:`, cartObject);
                    setNotification({ visible: true, message: `${item.product_name} added to cart!` });
                    setTimeout(() => {
                        setNotification({ visible: false, message: '' });
                    }, 3000); // Hide notification after 3 seconds
                }
            });
            return updatedCart;
        });
    };
    const handleCardClick = (item) => {
        console.log("Item clicked:", item); // Add this line to log the item
        navigate(`/product/${item.id}`, {
            state: {
                id: item.id,
                name: item.name,
                cost: item.cost,
                image: item.image,
                stock: item.stock,
                specification: item.specification 
            },
        });
    };
    
    
    return (
        <div className='cards__section'>
            <h2>{title}</h2>
            <div className='cards'>
                {items.map((item) => (
                    <div 
                        className='card' 
                        key={item.id} 
                        onClick={() => handleCardClick(item)}
                    >
                        <div className='card__image'>
                            <img src={item.image || 'placeholder.png'} alt={item.product_name || "Product"} />
                        </div>
                        <div className='card__info'>
                            <h4>{item.name || "Unnamed Product"}</h4>
                            <p>{item.cost}</p>
                            <button 
                                className='add-to-cart' 
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    onAddToCart(item);
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {notification.visible && (
                <div className='notification'>
                    {notification.message}
                </div>
            )}
        </div>
    );
}

export default Section;
