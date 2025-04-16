import React from "react";

const CheckoutInfo = ({
  account,
  cart,
  totalFee,
  isPurchasing,
  handlePurchase,
  transactionHash,
  documentCids,
  hasBought,
  shippingAddress,
}) => {
  return (
    <div className="checkout-info">
      <div className="checkout-info-top">
        <h3>Buyer Address</h3>
        <p>{account || "No wallet connected"}</p>
        {shippingAddress && (
        <div className="shipping-address">
          <h4>Shipping Address</h4>
          <p>{shippingAddress}</p>
        </div>
      )}
        
        
        <h3>Cart Items</h3>
        {cart.map((item, index) => (
          <div key={`${item.id}-${index}`} className="checkout-item">
            <img
              src={item.image || "/images/placeholder.png"}
              alt={item.product_name || item.name}
              className="checkout-item__image"
              onError={(e) => (e.target.src = "/images/placeholder.png")}
            />
            <div className="checkout-item__info">
              <h4 className="checkout-item_title">{item.product_name || item.name}</h4>
              <p className="checkout-item_cost">{item.cost} ETH</p>
            </div>
          </div>
        ))}
      </div>
      <div className="checkout-info-bottom">
        <h3>Total Fee</h3>
        <p>{totalFee.toFixed(2)} ETH</p>
        <button className="Purchase-btn" onClick={handlePurchase} disabled={isPurchasing || !account || !cart?.length}>
          {isPurchasing ? "Processing..." : "Purchase with MetaMask"}
        </button>
        {transactionHash && <p>Transaction Hash: {transactionHash}</p>}
        {documentCids.length > 0 && (
          <div>
            <h3>Purchase Documents</h3>
            {documentCids.map(({ productId, orderId, cid }, index) => (
              <p key={index}>
                Order {orderId} (Product {productId}): Receipt downloaded (Transaction: {cid})
              </p>
            ))}
          </div>
        )}
        {hasBought && <p>Purchase successful!</p>}
      </div>
    </div>
  );
};

export default CheckoutInfo;