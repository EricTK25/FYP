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
  const [contextcars, setContextcars] = useState(null);

  const gun = Gun({ peers: "[invalid url, do not cite] "}); 

  // Function to connect MetaMask wallet and load cart from GunDB
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

      // Load cart data for this account from GunDB
      const userNode = gun.get(`user_${accounts[0]}`);
      userNode.get('cart').once((cartData) => {
        setCart(cartData || []);
        console.log(`Loaded cart for account ${accounts[0]}:`, cartData || []);
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Function to disconnect wallet and clear cart
  const disconnectWallet = () => {
    setAccount(null);
    setCart([]); // Clear cart when disconnecting
  };

  // Function to load tokens from the contract
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
    userNode.get('cart').put(newCart, () => {
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
        contextcars,
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