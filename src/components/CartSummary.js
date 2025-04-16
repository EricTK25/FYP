import React from "react";

const CartSummary = ({ cart, agreeTerms, setAgreeTerms, handleCheckout }) => {
  return (
    <div className="cart-footer">
      <div className="cart-note">
        <p>
          International orders may incur customs charges that are not included in the shipping fee. Please refer to our FAQs for more information regarding customs charges/import fees.
        </p>
      </div>
      <div className="cart-summary">
        <p className="cart-subtotal">
          Subtotal ({cart.length} {cart.length === 1 ? "Item" : "Items"}): $
          {cart.reduce((total, item) => total + parseFloat(item.cost || 0), 0).toFixed(2)}
        </p>
        <label className="cart-terms">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          I agree to terms and refund policy
        </label>
        <button
          className="cart-checkout-button"
          onClick={handleCheckout}
          disabled={!agreeTerms}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartSummary;