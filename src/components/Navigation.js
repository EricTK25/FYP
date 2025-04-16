import React, { useEffect, useState } from "react";
import Gun from "gun";
import { useEthereum } from '../EthereumContext';

function Navigation() {
    const { account, connectWallet } = useEthereum();
    const gun = Gun();
    const [copied, setCopied] = useState(false);

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

    const handleButtonClick = async () => {
        if (account) {
            try {
                await navigator.clipboard.writeText(account);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
            } catch (err) {
                console.error("Failed to copy address:", err);
            }
        } else {
            connectWallet();
        }
    };

    return (
        <div className="Navigation">
            <div className="navbar">
                <div className="navbar-left">
                    <span className="app-title">Vehicle App</span>
                </div>
                <button className="connect-wallet" onClick={handleButtonClick}>
                    {copied ? "Copied!" : account ? `${account.slice(0,6)}...${account.slice(-4)}` : "Connect Wallet"}
                </button>
            </div>
        </div>
    );
}

export default Navigation;