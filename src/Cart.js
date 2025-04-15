import React, { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import Gun from "gun";
import { useEthereum } from "./EthereumContext";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

// Components
import FooterNavigation from "./components/FooterNavigation";
import Navigation from "./components/Navigation";

// ABIs
import CarrierApp from "./abis/CarrierApp.json";

// Config
import config from "./config.json";

const Cart = ({ onRemoveFromCart, onCheckout }) => {
  const { account } = useEthereum();
  const navigate = useNavigate();
  const gunRef = useRef(null);
  const [cart, setCart] = useState([]);
  const [fullCartItems, setFullCartItems] = useState([]);
  const [notification, setNotification] = useState({ visible: false, message: "" });
  const [provider, setProvider] = useState(null);
  const [carrierapp, setCarrierApp] = useState(null);

  // Initialize Gun.js and blockchain
  useEffect(() => {
    // Gun.js
    if (!gunRef.current) {
      gunRef.current = Gun({ peers: ["http://localhost:8765/gun"] });
    }

    // Blockchain
    const initBlockchain = async () => {
      try {
        if (!window.ethereum) {
          console.error("MetaMask is not installed");
          return;
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();

        if (!config[chainId]?.CarrierApp?.address) {
          console.error(`Contract not deployed on network ${chainId}`);
          return;
        }

        const carrierapp = new ethers.Contract(
          config[chainId].CarrierApp.address,
          CarrierApp,
          provider
        );

        setProvider(provider);
        setCarrierApp(carrierapp);
      } catch (error) {
        console.error("Error initializing blockchain:", error);
      }
    };

    initBlockchain();

    return () => {
      if (gunRef.current) {
        gunRef.current.off();
      }
    };
  }, []);

  // Load cart from Gun.js
  useEffect(() => {
    if (!account || !gunRef.current) {
      setCart([]);
      setFullCartItems([]);
      return;
    }

    const userCartNode = gunRef.current.get(`user_${account}`).get("cart");
    const loadedItems = [];

    userCartNode.map().once((data, key) => {
      if (data === null || !data.id || !key.startsWith("item_")) {
        return;
      }
      loadedItems.push(data);
      setCart([...loadedItems]);
    });
  }, [account]);

  // Fetch full item details from blockchain
  useEffect(() => {
    const fetchFullItems = async () => {
      if (!carrierapp || cart.length === 0) {
        setFullCartItems([]);
        return;
      }

      const fullItems = [];
      for (const cartItem of cart) {
        try {
          const item = await carrierapp.getProduct(cartItem.id);
          fullItems.push({
            id: item.product_id.toString(),
            name: item.name,
            cost: ethers.formatUnits(item.cost.toString(), "ether"),
            image: item.image,
            stock: item.stock.toString(),
            specification: {
              color: item.specs.color || "",
              engine_power: item.specs.engine_power || "",
              fuel: item.specs.fuel || "",
              interior: item.specs.interior || "",
              mileage: item.specs.mileage || "",
              condition: item.specs.condition || "",
              cubic_capacity: item.specs.cubic_capacity || "",
            },
            highlights: item.highlights,
          });
        } catch (error) {
          console.error(`Error fetching item ${cartItem.id}:`, error);
        }
      }
      setFullCartItems(fullItems);
    };

    fetchFullItems();
  }, [cart, carrierapp]);

  // Delete items from cart
  const deleteSelectedItems = (selectedIds) => {
    const updatedCart = cart.filter((item) => !selectedIds.includes(item.id));
    setCart(updatedCart);

    if (account && gunRef.current) {
      const userCartNode = gunRef.current.get(`user_${account}`).get("cart");

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
            console.log(`Cart updated in GunDB for account ${account}:`, updatedCartObject);
            // Clean up old keys
            userCartNode.once((oldData) => {
              if (oldData && typeof oldData === "object") {
                Object.keys(oldData).forEach((key) => {
                  if (key === "_" || key === "#") return;
                  if (!updatedCartObject.hasOwnProperty(key)) {
                    userCartNode.get(key).put(null);
                  }
                });
              }
            });
          }
        });
      }
    }
  };

  // Handle item removal
  const handleRemove = (itemId) => {
    deleteSelectedItems([itemId]);
    if (onRemoveFromCart) {
      onRemoveFromCart(itemId);
    }
    setNotification({ visible: true, message: "Item removed from cart!" });
    setTimeout(() => {
      setNotification({ visible: false, message: "" });
    }, 3000);
  };

  // Handle item click
  const handleItemClick = (item) => {
    const fullItem = fullCartItems.find((fi) => fi.id === item.id) || item;
    navigate(`/product/${item.id}`, {
      state: {
        id: item.id,
        name: fullItem.name,
        cost: fullItem.cost,
        image: fullItem.image,
        stock: fullItem.stock || "0",
        specification: fullItem.specification || {
          color: "",
          engine_power: "",
          fuel: "",
          interior: "",
          mileage: "",
          condition: "",
          cubic_capacity: "",
        },
        highlights: fullItem.highlights || "",
      },
    });
  };

  // Handle checkout
  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout(fullCartItems);
    }
    navigate("/checkout", { state: { cart: fullCartItems } });
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
                <div
                  key={`${item.id}-${index}`}
                  className="cart-item"
                  onClick={() => handleItemClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleItemClick(item)}
                >
                  <img
                    src={item.image || "/images/placeholder.png"}
                    alt={item.name || "Vehicle"}
                    className="cart-item__image"
                    onError={(e) => (e.target.src = "/images/placeholder.png")}
                  />
                  <div className="cart-item__info">
                    <h4>{item.name || "Unnamed Vehicle"}</h4>
                    <p>{item.cost} ETH</p>
                  </div>
                  <button
                    className="remove-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.id);
                    }}
                  >
                    Remove from Cart
                  </button>
                </div>
              ))}
            </div>
            <div className="summary-box">
              <p>
                Subtotal: {cart.reduce((total, item) => total + parseFloat(item.cost || 0), 0).toFixed(4)} ETH
              </p>
              <label>
                <input type="checkbox" /> I agree to terms and refund policy
              </label>
              <button className="checkout-button" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
      <FooterNavigation />
      {notification.visible && (
        <div className="notification" role="alert">
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Cart;