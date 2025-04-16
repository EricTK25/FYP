import { ethers, parseUnits, formatEther } from "ethers";
import CarrierApp from "../abis/CarrierApp.json";
import DocumentRegistry from "../abis/DocumentRegistry.json";
import config from "../config.json";

export const loadBlockchainData = async ({ setProvider, setCarrierApp, setDocumentRegistry, setNotification }) => {
  if (!window.ethereum) {
    setNotification({ visible: true, message: "MetaMask is not installed!" });
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const chainId = network.chainId.toString();

    if (!config[chainId]?.CarrierApp?.address) {
      setNotification({ visible: true, message: "CarrierApp not deployed on this network!" });
      return;
    }
    if (!config[chainId]?.DocumentRegistry?.address) {
      setNotification({ visible: true, message: "DocumentRegistry not deployed on this network!" });
      return;
    }

    const carrierapp = new ethers.Contract(
      config[chainId].CarrierApp.address,
      CarrierApp,
      provider
    );

    const documentRegistry = new ethers.Contract(
      config[chainId].DocumentRegistry.address,
      DocumentRegistry,
      provider
    );

    setProvider(provider);
    setCarrierApp(carrierapp);
    setDocumentRegistry(documentRegistry);

    console.log("Network chainId:", chainId);
    console.log("CarrierApp address:", config[chainId].CarrierApp.address);
    console.log("DocumentRegistry address:", config[chainId].DocumentRegistry.address);
  } catch (error) {
    console.error("Error loading blockchain data:", error);
    setNotification({ visible: true, message: "Failed to connect to blockchain: " + error.message });
  }
};

export const buyHandler = async (product_id, cost, provider, carrierapp) => {
  try {
    const signer = await provider.getSigner();
    const estimatedGas = await carrierapp
      .connect(signer)
      .buy.estimateGas(product_id, { value: cost });
    console.log(`Estimated gas for product ${product_id}:`, estimatedGas.toString());

    const transaction = await carrierapp
      .connect(signer)
      .buy(product_id, { value: cost, gasLimit: estimatedGas * 120n / 100n });
    const receipt = await transaction.wait();
    console.log(`Transaction confirmed: ${transaction.hash}`);

    const orderCount = await carrierapp.getOrderCount(signer.address);
    return { transaction, receipt, orderId: orderCount };
  } catch (error) {
    console.error(`buyHandler error for product ${product_id}:`, error);
    let message = "Purchase failed.";
    if (error.reason?.includes("ItemNotFound")) {
      message = `Product ID ${product_id} does not exist.`;
    } else if (error.reason?.includes("OutOfStock")) {
      message = `Product ID ${product_id} is out of stock.`;
    } else if (error.reason?.includes("InsufficientPayment")) {
      const required = await carrierapp.getProduct(product_id).then(p => p.cost.toString());
      message = `Insufficient payment for product ${product_id}. Sent: ${formatEther(cost)} ETH, Required: ${formatEther(required)} ETH.`;
    } else if (error.message.includes("insufficient funds")) {
      message = "Insufficient ETH in your wallet.";
    } else if (error.message.includes("user rejected")) {
      message = "Transaction rejected by user.";
    }
    throw new Error(message);
  }
};