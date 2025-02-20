import React, { useState, useEffect } from "react";
import { ethers } from 'ethers'

// ABIs
import CarrierApp from './abis/CarrierApp.json'

import Navigation from './components/Navigation'
import HeroSection from "./components/HeroSection";
import Product from "./components/Product";
import Section from "./components/Section";
// Config
import config from './config.json'
function Buy() {
    const [acc, setAccount] = useState(null)
    const [provider, setProvider] = useState(null)
    const [carrierapp, setCarrierApp] = useState(null)
    const [loading, setLoading] = useState(true);
    const [cars, setCar] = useState(null)
    const [item, setItem] = useState({})
    const [toggle, setToggle] = useState(false)
    const togglePop = (item) => {
        setItem(item)
        toggle ? setToggle(false) : setToggle(true)
    }
    const loadBlockchainData = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(provider);
            const network = await provider.getNetwork();
            const carrierapp = new ethers.Contract(
                config[network.chainId].CarrierApp.address,
                CarrierApp,
                provider
            );
            setCarrierApp(carrierapp);
            const totalItems = 9;
            const items = [];
            for (var i = 0; i < totalItems; i++) {
                console.log(await carrierapp.items(i + 1));
                const item = await carrierapp.items(i + 1)
                items.push(item)
            }
            setCar(items);
        } catch (error) {
            console.error("Error in loadBlockchainData:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBlockchainData();
    }, []);
    return (
        <div>
            <Navigation account={acc} setAccount={setAccount} />
            <HeroSection />
            <h2>Vehicle App Best Sellers</h2>
            {cars && (
                <>
                    <Section title={"Cars"} items={cars} togglePop={togglePop} />
                </>
            )}
            {toggle && (
                <Product item={item} provider={provider} account={acc} carrierapp={carrierapp} togglePop={togglePop} />
            )}
        </div>
    );
}
export default Buy;