<<<<<<< Updated upstream
import { ethers } from 'ethers';

const Navigation = ({ account, setAccount }) => {
    const connectHandler = async () =>{
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'});
        const account = ethers.getAddress(accounts[0])
        setAccount(account)
    }
    return (
        <nav>
            <div className='nav__brand'>
                <h1>Vehicle App</h1>
            </div>
            {account ? (
                <button type="button" className='nav__connect'>
                    {account.slice(0, 6) + '...' + account.slice(38, 42)}
                </button>
            ) : (
                <button type="button" className='nav__connect' onClick={connectHandler}>
                    Connect
                </button>
            )}

        </nav>
    );
}

export default Navigation;
=======
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
>>>>>>> Stashed changes
