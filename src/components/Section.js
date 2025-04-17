import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Gun from "gun";
import { useEthereum } from "../EthereumContext";
import { useCart } from "../CartContext"; // Import the cart context
import "../App.css";

const Section = ({ title, items }) => {
  const { account, contextcars} = useEthereum();
  const { cart, setCart } = useCart(); // Use cart context
  const navigate = useNavigate();
  const gunRef = useRef(null);
  const timeoutRef = useRef(null);
  const [notification, setNotification] = useState({ visible: false, message: "" });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    try {
      gunRef.current = Gun({ peers: [process.env.REACT_APP_GUN_PEER || "http://localhost:8765/gun"] });
    } catch (error) {
      console.error("Failed to initialize Gun.js:", error);
      showNotification("Failed to connect to storage.");
    }
    return () => gunRef.current?.off();
  }, []);

  const showNotification = (message) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setNotification({ visible: true, message });
    timeoutRef.current = setTimeout(() => {
      setNotification({ visible: false, message: "" });
    }, 3000);
  };

  const onAddToCart = async (item) => {
    if (isAdding || !account) {
      if (!account) showNotification("Please connect your wallet to add items to the cart.");
      return;
    }

    setIsAdding(true);
    setCart((prevCart) => {
      const updatedCart = [...prevCart, { id: item.id, name: item.name, cost: item.cost, image: item.image }];
      const userNode = gunRef.current.get(`user_${account}`);
      const cartNode = userNode.get("cart");

      updatedCart.forEach((cartItem, index) => {
        cartNode.get(`item_${index}_${Date.now()}`).put(cartItem);
      });

      cartNode.put(null, (ack) => {
        if (ack.err) {
          console.error(`Error saving cart for account ${account}:`, ack.err);
          showNotification("Failed to save cart. Please try again.");
        } else {
          console.log(`Cart saved for account ${account}`);
          showNotification(`${item.name} added to cart!`);
        }
      });

      return updatedCart;
    });
    setIsAdding(false);
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
        seller: item.seller,
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
          {contextcars.map((item) => (
            <div
              className="card"
              key={item.id}
              onClick={() => handleCardClick(item)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleCardClick(item)}
            >
              <div className="card__image">
                <img
                  src={item.image || "/images/placeholder.png"}
                  alt={item.name || "Vehicle"}
                  onError={(e) => {
                    console.warn(`Failed to load image for ${item.name}: ${item.image}`);
                    e.target.src = "/images/placeholder.png";
                  }}
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
                  disabled={isAdding}
                  aria-label={`Add ${item.name || "vehicle"} to cart`}
                >
                  {isAdding ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {notification.visible && (
        <div className="notification" role="alert" aria-live="polite">
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Section;