import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Gun from "gun";
import { useEthereum } from "../EthereumContext";
import { useCart } from "../CartContext";
import Navigation from "./Navigation";
import FooterNavigation from "./FooterNavigation";
import "../App.css";

function ProductDetail() {
  const { cart, setCart } = useCart();
  const location = useLocation();
  const { account } = useEthereum();
  const { id, name, cost, image, stock, specification, highlights } = location.state || {};
  const gunRef = useRef(null);
  const timeoutRef = useRef(null);
  const [notification, setNotification] = useState({ visible: false, message: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSpecOpen, setIsSpecOpen] = useState(true);
  const [isHighlightOpen, setIsHighlightOpen] = useState(true);

  // Assuming multiple images might be available; use an array if provided, otherwise single image
  const images = Array.isArray(image) ? image : [image || "/images/placeholder.png"];

  useEffect(() => {
    try {
      gunRef.current = Gun({ peers: [process.env.REACT_APP_GUN_PEER || "http://localhost:8765/gun"] });
    } catch (error) {
      console.error("Failed to initialize Gun.js:", error);
      showNotification("Failed to connect to storage.");
    }
    return () => {
      gunRef.current?.off();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
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
    if (cart.some((cartItem) => cartItem.id === item.id)) {
      showNotification("Item already in cart!");
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

  const displayData = { id, name, cost, image, stock, specification, highlights };

  const specFields = specification
    ? [
        { label: "Color", value: specification.color || "Unknown" },
        { label: "Interior", value: specification.interior || "Unknown" },
        { label: "Condition", value: specification.condition || "Unknown" },
        { label: "Fuel", value: specification.fuel || "Unknown" },
        { label: "Mileage", value: specification.mileage || "Unknown" },
        { label: "Engine Power", value: specification.engine_power || "Unknown" },
        { label: "Cubic Capacity", value: specification.cubic_capacity || "Unknown" },
      ]
    : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!displayData.id) {
    return (
      <div>
        <Navigation />
        <div className="product-detail">
          <h2>Product Not Found</h2>
          <p>Please select a product from the main page.</p>
        </div>
        <FooterNavigation />
      </div>
    );
  }

  return (
    <div>
    <Navigation />
    <div className="product-detail">
      <div className="product-container">
        <h2 className="product-title">{displayData.name || "Unnamed Vehicle"}</h2>
        <div className="carousel">
          <button className="carousel-arrow left" onClick={prevImage}>
            &lt;
          </button>
          <div className="carousel-image">
            <img
              src={images[currentImageIndex] || "/images/placeholder.png"}
              alt={displayData.name || "Vehicle"}
              onError={(e) => {
                console.warn(`Failed to load image for ${displayData.name}: ${images[currentImageIndex]}`);
                e.target.src = "/images/placeholder.png";
              }}
            />
          </div>
          <button className="carousel-arrow right" onClick={nextImage}>
            &gt;
          </button>
        </div>
        <div className="carousel-dots">
          {images.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentImageIndex ? "active" : ""}`}
              onClick={() => setCurrentImageIndex(index)}
            ></span>
          ))}
        </div>
        <div className="product-info">
          <div className="section vehicle-specifications">
            <h3 onClick={() => setIsSpecOpen(!isSpecOpen)}>
              Vehicle Specifications <span className="dropdown-arrow">▼</span>
            </h3>
            {isSpecOpen && displayData.specification && (
              <div className="spec-grid">
                {specFields.map((spec, index) => (
                  <div key={index} className="spec-item">
                    <strong>{spec.label}:</strong> {spec.value}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="section highlights">
            <h3 onClick={() => setIsHighlightOpen(!isHighlightOpen)}>
              Highlights <span className="dropdown-arrow">▼</span>
            </h3>
            {isHighlightOpen && displayData.highlights && (
              <ul className="highlight-list">
                {Array.isArray(highlights)
                  ? highlights.map((highlight, index) => <li key={index}>{highlight}</li>)
                  : highlights.split("\n").map((highlight, index) => <li key={index}>{highlight.trim()}</li>)
                }
              </ul>
            )}
          </div>
          <p className="cost">Price: {displayData.cost} ETH</p>
          <p className="stock">Stock: {displayData.stock} available</p>
          <button
            className="details-add-to-cart"
            onClick={() => onAddToCart(displayData)}
            disabled={isAdding || displayData.stock === "0"}
            aria-label={`Add ${displayData.name || "vehicle"} to cart`}
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
      {notification.visible && (
        <div className="notification" role="alert" aria-live="polite">
          {notification.message}
        </div>
      )}
      <FooterNavigation />
    </div>
    </div>
  );
}

export default ProductDetail;