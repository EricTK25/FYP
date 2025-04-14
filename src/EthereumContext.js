import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Gun from 'gun';
import CarrierTokenABI from './CarrierTokenABI.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

const EthereumContext = createContext();

export function EthereumProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [allTokens, setAllTokens] = useState([]);
  const [cart, setCart] = useState([]); // Store cart items for the user
  const [productCount, setProductCount] = useState(1);
  const [Contextcars, setContextcars] = useState(null);

  const gun = Gun(); // Initialize GunDB instance

  // Function to connect MetaMask wallet and save the account in GunDB
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CarrierTokenABI,
        signer
      );

      setProvider(provider);
      setContract(contract);
      setAccount(accounts[0]);

      // Save the account in GunDB
      const userNode = gun.get(`user_${accounts[0]}`);
      userNode.put({ address: accounts[0] }, () => {
        console.log(`Wallet address ${accounts[0]} saved in GunDB.`);
      });

      // Load cart data for this account from GunDB
      userNode.once((data) => {
        if (data && data.cart) {
          setCart(data.cart);
          console.log(`Loaded cart for account ${accounts[0]}:`, data.cart);
        } else {
          console.log(`No cart found for account ${accounts[0]}.`);
        }
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  
  const disconnectWallet = () => {
    setAccount(null); 

  };

  const loadTokens = async () => {
    try {
      if (!contract) return;

      const totalSupply = await contract.getTokenIds();
      const tokens = [];
      
      for (let i = 1; i <= totalSupply; i++) {
        const carrier = await contract.tokenId2Carrier(i);
        tokens.push({
          id: i,
          owner: carrier.owner,
          name: carrier.carrierName,
          type: carrier.carrierType,
          price: ethers.formatEther(carrier.price),
          year: Number(carrier.year)
        });
      }

      setAllTokens(tokens);
    } catch (error) {
      console.error("Error loading tokens:", error);
    }
  };

  // Function to update the cart in GunDB and state
  const updateCart = (newCart) => {
    if (!account) {
      console.error("No connected account to update cart.");
      return;
    }

    setCart(newCart);

    // Save updated cart to GunDB
    const userNode = gun.get(`user_${account}`);
    userNode.put({ cart: newCart }, () => {
      console.log(`Cart updated for account ${account}:`, newCart);
    });
  };

  return (
    <EthereumContext.Provider 
      value={{
        provider,
        contract,
        account,
        allTokens,
        cart,
        productCount,
        Contextcars,
        disconnectWallet,
        connectWallet,
        loadTokens,
        updateCart,
        setProductCount,
        setContextcars,
      }}
    >
      {children}
    </EthereumContext.Provider>
  );
}

export function useEthereum() {
  return useContext(EthereumContext);
}
