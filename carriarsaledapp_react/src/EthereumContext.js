import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import CarrierTokenABI from './CarrierTokenABI.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

const EthereumContext = createContext();

export function EthereumProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [allTokens, setAllTokens] = useState([]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts'
      });
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

      loadTokens(contract, signer);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const loadTokens = async (contract, signer) => {
    try {
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
          year: carrier.year
        });
      }

      setAllTokens(tokens);
    } catch (error) {
      console.error("Error loading tokens:", error);
    }
  };

  return (
    <EthereumContext.Provider 
      value={{
        provider,
        contract,
        account,
        allTokens,
        connectWallet,
        loadTokens
      }}
    >
      {children}
    </EthereumContext.Provider>
  );
}

export function useEthereum() {
  return useContext(EthereumContext);
}