import { ethers } from "ethers";
import CarrierApp from "../abis/CarrierApp.json";
import config from "../config.json";

export const initializeBlockchain = async (setCarrierApp, setNotification) => {
  try {
    if (!window.ethereum) {
      console.error("MetaMask is not installed");
      setNotification({ visible: true, message: "MetaMask is not installed!", type: "error" });
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const chainId = network.chainId.toString();

    if (!config[chainId]?.CarrierApp?.address) {
      console.error(`Contract not deployed on network ${chainId}`);
      setNotification({ visible: true, message: `Contract not deployed on network ${chainId}!`, type: "error" });
      return;
    }

    const carrierapp = new ethers.Contract(
      config[chainId].CarrierApp.address,
      CarrierApp,
      provider
    );

    setCarrierApp(carrierapp);
  } catch (error) {
    console.error("Error initializing blockchain:", error);
    setNotification({ visible: true, message: "Failed to initialize blockchain: " + error.message, type: "error" });
  }
};

export const fetchFullItems = async (cart, carrierapp, setFullCartItems) => {
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