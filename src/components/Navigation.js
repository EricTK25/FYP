import React, { useEffect } from "react";
import Gun from "gun";
import { Link } from 'react-router-dom';
import { useEthereum } from '../EthereumContext';

function Navigation() {
    const { account, connectWallet } = useEthereum();
    const gun = Gun();

    useEffect(() => {
        if (account) {
            const userNode = gun.get(`user_${account}`);
            userNode.put({ address: account }); 
            userNode.once((data) => {
                if (data) {
                    console.log(`All data for the address ${account}:`, data);
                } else {
                    console.log(`No data found for the address ${account}.`);
                }
            });
        }
    }, [account]);

    return (
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
