<<<<<<< Updated upstream
import { ethers } from 'ethers'

const Section = ({ title, items, togglePop }) => {
=======
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Gun from "gun";
import { useEthereum } from "../EthereumContext";
import "../App.css";

const Section = ({ title, items, cart, setCart }) => {
    const { account } = useEthereum();
    const navigate = useNavigate();
    const gunRef = React.useRef();

    if (!gunRef.current) {
        gunRef.current = Gun();
    }
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
                } else {
                    console.log(`Cart successfully saved for account ${account}:`, cartObject);
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
            },
        });
    };

>>>>>>> Stashed changes
    return (
        <div className='cards__section'>
            <h3 id ={title}>{title}</h3>

            <hr/>

            <div className='cards'>
<<<<<<< Updated upstream
                {items.map((item, index) => (
                    <div className='card' key={index} onClick={() => togglePop(item)}>
                        <div className='card__image'>
                            <img src={item.image} alt="Item" />
                        </div>
                        <div className='card__info'>
                            <h4>{item.name}</h4>
                            <p>{ethers.formatUnits(item.cost.toString(), 'ether')} ETH</p>
=======
                {items.map((item) => (
                    <div 
                        className='card' 
                        key={item.id || item.name} 
                        onClick={() => handleCardClick(item)}
                    >
                        <div className='card__image'>
                            <img src={item.image || 'placeholder.png'} alt={item.name || "Product"} />
                        </div>
                        <div className='card__info'>
                            <h4>{item.name || "Unnamed Product"}</h4>
                            <p>{item.cost ? `${item.cost} ETH` : "N/A"}</p>
                            <button 
                                className='add-to-cart' 
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    onAddToCart(item);
                                }}
                            >
                                Add to Cart
                            </button>
>>>>>>> Stashed changes
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Section;
