// App.js
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Routes, Route, Link } from 'react-router-dom';
import CarrierTokenABI from './CarrierTokenABI.json';
import {
  Home,
  MyTokens,
  MintToken,
  TokenDetail,
  Transactions
} from './pages';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [allTokens, setAllTokens] = useState([]);

  // Initialize Ethereum connection
  const connectWallet = async () => {
    if (window.ethereum) {
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
        
        console.log("CONTRACT_ADDRESS",CONTRACT_ADDRESS);
        console.log("signer",signer);
        console.log("contract",contract.getAddress());
        console.log("accounts[0]",accounts[0]);
        setProvider(provider);
        setContract(contract);
        setAccount(accounts[0]);
        
        loadTokens(contract);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    }
  };

  // Load all tokens
  const loadTokens = async (contract) => {
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
  };

  return (
      <>
        <nav>
          <Link to="/home">Home</Link>
          <Link to="/mint">Mint</Link>
          <Link to="/my-tokens">My Tokens</Link>
          
          {account ? (
            <span>Connected: {account.slice(0,6)}...{account.slice(-4)}</span>
          ) : (
            <button onClick={connectWallet}>Connect Wallet</button>
          )}
        </nav>

        <Routes>
          <Route path="/home" element={<Home tokens={allTokens} />} />
          <Route path="/my-tokens" element={<MyTokens contract={contract} account={account} />} />
          <Route path="/mint" element={<MintToken contract={contract} />} />
          <Route path="/token/:tokenId" element={<TokenDetail contract={contract} />} />
          <Route path="/transactions/:tokenId" element={<Transactions contract={contract} />} />
        </Routes>
      </>
  );
}

export default App;