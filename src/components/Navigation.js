import { Link } from 'react-router-dom';
import { useEthereum } from '../EthereumContext';
import "../App.css";
function Navigation(){
      const { account, connectWallet } = useEthereum();
      return(
        <div className="Navigation">
        <div className="navbar">
        <span className="app-title">Vehicle App</span>
        <Link to="/mint">Mint</Link>
        <Link to="/allTokens">AllTokens</Link>&nbsp;&nbsp;
        <Link to="/Buy">Buy</Link>
        
        {account ? (
          <span>Connected: {account.slice(0,6)}...{account.slice(-4)}</span>
        ) : (
          <button className="connect-wallet" onClick={connectWallet}>Connect Wallet</button>
        )}
      </div>
      </div>
      );
}
export default Navigation;