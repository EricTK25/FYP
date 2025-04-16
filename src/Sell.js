import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Gun from "gun";
import { useEthereum } from "./EthereumContext";
import CarrierApp from "./abis/CarrierApp.json";
import Navigation from "./components/Navigation";
import FooterNavigation from "./components/FooterNavigation";
import config from "./config.json";

const Sell = () => {
  const { account } = useEthereum();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    image: "",
    cost: "",
    stock: "",
    color: "",
    engine_power: "",
    fuel: "",
    interior: "",
    mileage: "",
    condition: "",
    cubic_capacity: "",
    highlights: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [carrierApp, setCarrierApp] = useState(null);
  const gun = Gun(); // Updated to mimic ProfileP

  useEffect(() => {
    const setupContract = async () => {
      if (!window.ethereum) {
        setError("MetaMask is not installed");
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        const signer = await provider.getSigner();
        console.log("Signer address:", signer.address);
        setSigner(signer);
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();
        if (!config[chainId]?.CarrierApp?.address) {
          setError(`Contract not deployed on network ${chainId}`);
          return;
        }
        const contract = new ethers.Contract(
          config[chainId].CarrierApp.address,
          CarrierApp,
          signer
        );
        setCarrierApp(contract);
      } catch (err) {
        setError("Failed to initialize provider or signer: " + err.message);
      }
    };
    setupContract();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!account) {
      setError("Please connect your wallet to sell a car.");
      return;
    }

    if (!carrierApp || !signer) {
      setError("Contract or signer not initialized.");
      return;
    }

    const requiredFields = [
      "name",
      "category",
      "image",
      "cost",
      "stock",
      "color",
      "engine_power",
      "fuel",
      "interior",
      "mileage",
      "condition",
      "cubic_capacity"
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    if (isNaN(formData.cost) || Number(formData.cost) <= 0) {
      setError("Cost must be a positive number.");
      return;
    }
    if (isNaN(formData.stock) || Number(formData.stock) <= 0) {
      setError("Stock must be a positive number.");
      return;
    }

    try {
      // Prepare item data
      const itemStruct = {
        product_id: 0, // Will be set by contract
        name: formData.name,
        category: formData.category,
        image: formData.image,
        cost: ethers.parseUnits(formData.cost, "ether"),
        stock: Number(formData.stock),
        specs: {
          color: formData.color,
          engine_power: formData.engine_power,
          fuel: formData.fuel,
          interior: formData.interior,
          mileage: formData.mileage,
          condition: formData.condition,
          cubic_capacity: formData.cubic_capacity
        },
        highlights: formData.highlights,
        seller: account
      };

      const specStruct = itemStruct.specs;

      // Call list with _id: 0 to use nextId
      console.log("Listing item with signer:", signer.address);
      const tx = await carrierApp.list(0, itemStruct, specStruct);
      console.log("List transaction:", tx);
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      // Parse logs to find List event
      const iface = carrierApp.interface;
      let id;
      for (const log of receipt.logs) {
        try {
          const parsedLog = iface.parseLog(log);
          if (parsedLog.name === "List") {
            id = Number(parsedLog.args.id);
            break;
          }
        } catch (err) {
          console.error("Error parsing log:", err);
        }
      }

      if (!id) {
        throw new Error("Failed to retrieve ID from List event");
      }
      console.log(`Assigned ID: ${id}`);

      // Prepare item data for Gun.js
      const itemData = {
        id,
        name: formData.name,
        category: formData.category,
        image: formData.image,
        cost: Number(formData.cost),
        stock: Number(formData.stock),
        specification: {
          color: formData.color,
          engine_power: formData.engine_power,
          fuel: formData.fuel,
          interior: formData.interior,
          mileage: formData.mileage,
          condition: formData.condition,
          cubic_capacity: formData.cubic_capacity
        },
        highlights: formData.highlights,
        seller: account
      };

      // Save to Gun.js
      await new Promise((resolve, reject) => {
        gun
          .get("carrierlist")
          .get(id.toString())
          .put(itemData, (ack) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              console.log(`Saved item ${id} to Gun.js`);
              resolve();
            }
          });
      });

      setSuccess(`Car successfully listed with ID ${id}!`);
      setFormData({
        name: "",
        category: "",
        image: "",
        cost: "",
        stock: "",
        color: "",
        engine_power: "",
        fuel: "",
        interior: "",
        mileage: "",
        condition: "",
        cubic_capacity: "",
        highlights: ""
      });
    } catch (err) {
      setError(`Failed to list car: ${err.message}`);
      console.error("Error details:", err);
      if (err.data) {
        console.error("Error data:", err.data);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto p-4">
        <h2 className="text-3xl font-bold text-center mb-6">Sell Your Car</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4">{success}</div>
        )}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md max-w-2xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cost (ETH)</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                step="0.01"
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Engine Power</label>
              <input
                type="text"
                name="engine_power"
                value={formData.engine_power}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fuel</label>
              <input
                type="text"
                name="fuel"
                value={formData.fuel}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Interior</label>
              <input
                type="text"
                name="interior"
                value={formData.interior}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mileage</label>
              <input
                type="text"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Condition</label>
              <input
                type="text"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cubic Capacity</label>
              <input
                type="text"
                name="cubic_capacity"
                value={formData.cubic_capacity}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Highlights</label>
              <textarea
                name="highlights"
                value={formData.highlights}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded"
                rows="4"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </main>
      <FooterNavigation />
    </div>
  );
};

export default Sell;