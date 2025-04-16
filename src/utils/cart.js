import Gun from "gun";

const gun = Gun();

export const clearCart = (account, navigate, setNotification) => {
  if (account) {
    const userCartNode = gun.get(`user_${account}`).get("cart");
    userCartNode.put(null, (ack) => {
      if (ack.err) {
        console.error("Error clearing cart in GunDB:", ack.err);
        setNotification({ visible: true, message: "Failed to clear cart in database." });
      } else {
        console.log(`Cart cleared for account ${account}`);
      }
    });
  }
  navigate("/");
};