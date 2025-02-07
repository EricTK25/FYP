import React from 'react';
import { Link } from 'react-router-dom';
import { useEthereum } from './EthereumContext';

function App() {
  const { account, connectWallet } = useEthereum();

  return (
    <>
      <nav>
        <Link to="/mint">Mint</Link>
        <Link to="/my-tokens">My Tokens</Link>
        
        {account ? (
          <span>Connected: {account.slice(0,6)}...{account.slice(-4)}</span>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
        <p>{account}</p>
      </nav>
    </>
  );
}


export default App;