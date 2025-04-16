import React, { useState, useEffect, useRef } from "react";
import { useEthereum } from "./EthereumContext";
import { useNavigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import FooterNavigation from "./components/FooterNavigation";
import CartItem from "./components/CartItem";
import CartSummary from "./components/CartSummary";
import { initializeGun, loadCartFromGun, updateCartInGun } from "./utils/gun";
import { initializeBlockchain, fetchFullItems } from "./utils/blockchaincart";
import "./Cart.css";

const Cart = ({ onRemoveFromCart, onCheckout }) => {
  const { account } = useEthereum();
  const navigate = useNavigate();
  const gunRef = useRef(null);
  const [cart, setCart] = useState([]);
  const [fullCartItems, setFullCartItems] = useState([]);
  const [notification, setNotification] = useState({ visible: false, message: "", type: "success" });
  const [carrierapp, setCarrierApp] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    initializeGun(gunRef);
    initializeBlockchain(setCarrierApp, setNotification);
    return () => gunRef.current?.off();
  }, []);

  useEffect(() => {
    loadCartFromGun(account, gunRef.current, setCart);
  }, [account]);

  useEffect(() => {
    fetchFullItems(cart, carrierapp, setFullCartItems);
  }, [cart, carrierapp]);

  const handleRemove = (itemId) => {
    const updatedCart = cart.filter((item) => item.id !== itemId);
    setCart(updatedCart);
    updateCartInGun(account, gunRef.current, updatedCart);
    if (onRemoveFromCart) {
      onRemoveFromCart(itemId);
    }
    setNotification({ visible: true, message: "Item removed from cart!", type: "success" });
    setTimeout(() => setNotification({ visible: false, message: "", type: "success" }), 3000);
  };

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

  const handleCheckout = () => {
    if (!agreeTerms) {
      setNotification({ visible: true, message: "Please agree to the terms and refund policy.", type: "error" });
      setTimeout(() => setNotification({ visible: false, message: "", type: "success" }), 3000);
      return;
    }
    if (onCheckout) {
      onCheckout(fullCartItems);
    }
    navigate("/checkout", { state: { cart: fullCartItems } });
  };

  return (
    <div>
      <Navigation />
      <div className="cart-page">
        <div className="cart-container">
          <h2 className="cart-title">Your Shopping Cart ({cart.length} Item{cart.length !== 1 ? "s" : ""})</h2>
          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty. Add some products to continue!</p>
              <button className="cart-empty-button" onClick={() => navigate("/")}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item, index) => (
                  <CartItem
                    key={`${item.id}-${index}`}
                    item={item}
                    onClick={() => handleItemClick(item)}
                    onRemove={() => handleRemove(item.id)}
                  />
                ))}
              </div>
              <CartSummary
                cart={cart}
                agreeTerms={agreeTerms}
                setAgreeTerms={setAgreeTerms}
                handleCheckout={handleCheckout}
              />
            </>
          )}
        </div>
        {notification.visible && (
          <div className={`cart-notification ${notification.type}`} role="alert">
            {notification.message}
          </div>
        )}
      </div>
      <FooterNavigation />
    </div>
  );
};

export default Cart;
