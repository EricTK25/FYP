import React from "react";

const CartItem = ({ item, onClick, onRemove }) => {
  return (
    <div
      className="cart-item"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <img
        src={item.image || "/images/placeholder.png"}
        alt={item.name || "Vehicle"}
        className="cart-item-image"
        onError={(e) => (e.target.src = "/images/placeholder.png")}
      />
      <div className="cart-item-details">
        <h4 className="cart-item-title">{item.name || "Unnamed Vehicle"}</h4>
        <p className="cart-item-cost">${item.cost}</p>
        <button
          className="cart-item-remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          Remove from Cart
        </button>
      </div>
    </div>
  );
};

export default CartItem;