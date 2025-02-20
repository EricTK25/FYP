import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom'; 

// ABIs
import CarrierApp from './abis/CarrierApp.json';

// Components
import Navigation from './components/Navigation';
import HeroSection from "./components/HeroSection";
import Section from "./components/Section"; 
import FooterNavigation from "./components/FooterNavigation";

// Config
import config from './config.json';

function Buy() {
    const specifications = [
    ];
    const highlights = [
    ];

    const [acc, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [carrierapp, setCarrierApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cars, setCar] = useState([]);
    
    const navigate = useNavigate();

    const loadBlockchainData = async () => {
        try {
            let provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(provider);
            const network = await provider.getNetwork();
            let carrierapp = new ethers.Contract(
                config[network.chainId].CarrierApp.address,
                CarrierApp,
                provider
            );
            setCarrierApp(carrierapp);
            const totalItems = 9;
            const items = [];
            for (var i = 0; i < totalItems; i++) {
                const item = await carrierapp.items(i + 1);
                items.push(item);
            }
            setCar(items);
        } catch (error) {
            console.error("Error in loadBlockchainData:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (item) => {
        navigate(`/product/${item.id}`, { state: { 
            id: item.id, 
            name: item.name, 
            cost: item.cost, 
            image: item.image,
            specifications: specifications,
            highlights: highlights
            // Add any other primitive values you need
        }});
    };

    useEffect(() => {
        loadBlockchainData();
    }, []);

    return (
        <div>
            <Navigation account={acc} setAccount={setAccount} />
            <HeroSection />
            <h2>Vehicle App Best Sellers</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <Section title={"Cars"} items={cars} onCardClick={handleCardClick} />
            )}
            <FooterNavigation></FooterNavigation>
        </div>
    );
}

export default Buy;