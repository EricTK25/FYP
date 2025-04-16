import Gun from "gun";

export const initializeGun = (gunRef) => {
  if (!gunRef.current) {
    gunRef.current = Gun({ peers: ["http://localhost:8765/gun"] });
  }
};

export const loadCartFromGun = (account, gun, setCart) => {
  if (!account || !gun) {
    setCart([]);
    return;
  }

  const userCartNode = gun.get(`user_${account}`).get("cart");
  const loadedItems = [];

  userCartNode.map().once((data, key) => {
    if (data === null || !data.id || !key.startsWith("item_")) {
      return;
    }
    loadedItems.push(data);
    setCart([...loadedItems]);
  });
};

export const updateCartInGun = (account, gun, updatedCart) => {
  if (!account || !gun) {
    return;
  }

  const userCartNode = gun.get(`user_${account}`).get("cart");

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
};