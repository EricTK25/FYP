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
  let { id, name, cost, image,specifications =[], highlights=[]} = location.state || {};
  specifications = [
    'Type: Sports Car',
    'Interior: Full leather, Black',
    'Condition: Accident-Free',
    'Fuel: Petrol',
    'Mileage: 7250 km',
    'Cubic Capacity: 5186 cm³',
    'Engine Power: 450 kW (603 hp)'
  ];
  highlights = [
    'Support through out the entire buying press',
    'Cars exclusively from well-established dealerships',
    'Factory warranty on new cars',
    'Worldwide delivery or pick up possible',
    'Arrangement of complete transport with necessary documents',
    'Supply of all export formalities for overseas shipments',
    'Registration for up to 12 months with plates and liability insurance (long test drive)'
  ]
  const [order, setOrder] = useState(null);
  const [hasBought, setHasBought] = useState(false);
  const [carrierapp, setCarrierApp] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const loadBlockchainData = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const carrierapp = new ethers.Contract(
        config[network.chainId].CarrierApp.address,
        CarrierApp,
        provider
      );

      const accounts = await provider.listAccounts();
      setAccount(accounts[0]);
      setProvider(provider);
      setCarrierApp(carrierapp);
    };

    loadBlockchainData();
  }, []);

  const fetchDetails = async () => {
    if (!carrierapp) {
      console.error("Carrier app instance is not defined");
      return;
    }

    const events = await carrierapp.queryFilter("Buy");
    const orders = events.filter(
      (event) => event.args.buyer === account && event.args.itemId.toString() === id.toString()
    );

    if (orders.length === 0) return;

    const order = await carrierapp.orders(account, orders[0].args.orderId);
    setOrder(order);
  };

  const buyHandler = async () => {
    const signer = await provider.getSigner();

    let transaction = await carrierapp.connect(signer).buy(id, { value: cost });
    await transaction.wait();

    setHasBought(true);
  };

  useEffect(() => {
    fetchDetails();
  }, [hasBought]);

  return (
    <div>
    <div className="product-detail">
      <Navigation account={account} setAccount={setAccount} />
      <div className="product-container">
        <h2>{name}</h2>
        <div className="product-image">
          <img src={image} alt={name} />
        </div>
        <div className="product-info">
          <div className="vehicle-specifications">
            <h3>Vehicle Specifications</h3>
            <ul>
            {specifications.map((spec, index) => (
                                <li key={index}>{spec}</li>
                            ))}
            </ul>
          </div>
          <div className="highlights">
            <h3>Highlights</h3>
            <ul>
            {highlights.map((highlight, index) => (
                                <li key={index}>{highlight}</li>
                            ))}
            </ul>
          </div>
          <button className="buy-button" onClick={buyHandler}>Purchase Now</button>
        </div>
      </div>
    </div>
    <FooterNavigation></FooterNavigation>
    </div>
  );
}

export default ProductDetail;