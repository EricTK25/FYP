import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { ethers } from 'ethers'
import "./App.css"; // Make sure to create a CSS file for styling

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import CarrierApp from './abis/CarrierApp.json'

// Config
import config from './config.json'
import { useEthereum } from './EthereumContext';

function App() {
  const { account, connectWallet } = useEthereum();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const [provider, setProvider] = useState(null)
  const [carrierapp, setCarrierApp] = useState(null)
  const [acc, setAccount] = useState(null)
  const [car, setCar] = useState(null)
  const [item, setItem] = useState({})
  const [toggle, setToggle] = useState(false)

  // Simulate fetching car data based on tokenId
  const fetchCars = async () => {
    setLoading(true);

    // Simulate fetching data
    const carData = [
      {
        tokenId: 1,
        name: "car",
        price: 1488,
        image: "https://via.placeholder.com/150",
      },
      {
        tokenId: 2,
        name: "ship",
        price: 888,
        image: "https://via.placeholder.com/150",
      },
      {
        tokenId: 3,
        name: "boat",
        price: 849,
        image: "https://via.placeholder.com/150",
      },
      {
        tokenId: 4,
        name: "piko",
        price: 693,
        image: "https://via.placeholder.com/150",
      },
      {
        tokenId: 5,
        name: "GTR",
        price: 469,
        image: "https://via.placeholder.com/150",
      },
      {
        tokenId: 6,
        name: "AE86",
        price: 450,
        image: "https://via.placeholder.com/150",
      },
    ];

    // Simulate delay (e.g., blockchain call)
    setTimeout(() => {
      setCars(carData);
      setLoading(false);
    }, 2000);
  };

  const togglePop = (item) => {
    setItem(item)
    toggle ? setToggle(false) : setToggle(true)
  }
  
  const loadBlockchainData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()
    const carrierapp = new ethers.Contract(config[network.chainId].CarrierApp.address, CarrierApp, provider)
    setCarrierApp(carrierapp)
    console.log(await carrierapp.items(0))
    const items = []
    for (var i = 0; i < 9; i++) {
      const item = await carrierapp.items(i+1)
      items.push(item)
    }

    const car = items.filter((item) => item.category === 'Car')
    setCar(car)
  }

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <Navigation/>
  );
}


export default App;