import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import CarrierApp from '../abis/CarrierApp.json';
import config from '../config.json';
import Navigation from './Navigation';
import FooterNavigation from './FooterNavigation';
import '../App.css'; // Import your CSS file

function ProductDetail() {
  const location = useLocation();
  let { id, name, cost, image, specification, highlights = [] } = location.state || {};
  console.log(specification)
  highlights = [
    'Support throughout the entire buying process',
    'Cars exclusively from well-established dealerships',
    'Factory warranty on new cars',
    'Worldwide delivery or pick up possible',
    'Arrangement of complete transport with necessary documents',
    'Supply of all export formalities for overseas shipments',
    'Registration for up to 12 months with plates and liability insurance (long test drive)'
  ];
  const [carrierapp, setCarrierApp] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const loadBlockchainData = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const carrierapp = new ethers.Contract(
        config[network.chainId].CarrierApp.address,
        CarrierApp,
        provider
      );
      setProvider(provider);
      setCarrierApp(carrierapp);
    };

    loadBlockchainData();
  }, []);

  return (
    <div>
      <div className="product-detail">
        <Navigation />
        <div className="product-container">
          <h2>{name}</h2>
          <div className="product-image">
            <img src={image} alt={name} />
          </div>
          <div className="product-info">
            <div className="vehicle-specifications">
              <h3>Vehicle Specifications</h3>
              {specification ? (
                <>
                  <p>Fuel: {specification || "N/A"}</p>
                  <p>Condition: {specification || "N/A"}</p>
                </>
              ) : (
                <p>Specifications not available</p>
              )}
            </div>
            <div className="highlights">
              <h3>Highlights</h3>
              <ul>
                {highlights.map((highlight, index) => (
                  <li key={`highlight-${index}`}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <FooterNavigation />
    </div>
  );
}

export default ProductDetail;
