import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEthereum } from './EthereumContext';
import FooterNavigation from "./components/FooterNavigation";
import Navigation from './components/Navigation';
import "./page.css";
const Gun = require('gun');
const insertData = require('./config/insertData.js');


export function AllTokens() {
    const { allTokens, loadTokens } = useEthereum();
    loadTokens();
    return (
        <div className="MyTokens">
            <h1>AllTokens</h1>
            <p>{JSON.stringify(allTokens)}</p>
        </div>
    );
}
export function MintToken() {
    const {account, contract, productCount, setProductCount, contextcars, setContextcars} = useEthereum();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
      carrierName: '',
      carrierType: 'car',
      registrationNumber: '',
      price: 0,
      year: new Date().getFullYear()
    });
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'year' ? Number(value) : value
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
  
      // Check account connection
      if (!account) {
        alert('Please connect your wallet first using the "Create Wallet" button!');
        return;
      }
  
      try {
        setIsSubmitting(true);

        // Construct Carrier struct
        const carrierData = {
          owner: account,
          carrierName: formData.carrierName,
          carrierType: formData.carrierType,
          registrationNumber: formData.registrationNumber,
          price: ethers.parseEther(formData.price.toString()),
          year: formData.year,
          txSucCount: 0
        };
  
        // Send transaction
        const tx = await contract.mintToken(carrierData);
        await tx.wait();
        
        // Reset form
        setFormData({
          carrierName: '',
          registrationNumber: '',
          price: 0,
          year: new Date().getFullYear()
        });
        
        alert('Carrier Token created successfully!');

        CreateCarrierToBuyList();
      } catch (err) {
        console.error('Contract call failed:', err);
        setError(err.message || 'Failed to create carrier');
      } finally {
        setIsSubmitting(false);
      }
    };

    const CreateCarrierToBuyList = async () => {
      const item = {
        product_id: insertData.length + productCount,
        product_name: formData.carrierName,
        product_category: formData.carrierType,
        product_image: 'https://purepng.com/public/uploads/large/black-edition-audi-luxury-car-1nm.png',
        cost: Number(ethers.parseEther(formData.price.toString())),
        stock: 1,
        specification: {
          color: "Black",
          engine_power: "280 HP",
          fuel: "Petrol",
          interior: "Leather",
          mileage: "21 MPG",
          condition: "New",
          cubic_capacity: "2800 cc",
        },
        highlights: "Luxury, High Tech"
      };
      setProductCount(productCount + 1);
      const gun = Gun({ peers: ['http://localhost:8765/gun'] });
      gun.get('carrierlist').get(item.product_id).put(item, (ack) => {
        if (ack.err)
          console.error('Error inserting item:', ack.err);
        else 
          console.log(`Inserted product ID ${item.product_id}: ${item.product_name}`);
      });
      setItemToContextcars(item);
    }

    const setItemToContextcars = (item) => {
      const cars = contextcars;
      cars.push({
        id: item.product_id.toString(),
        name: item.product_name,
        cost: ethers.formatUnits(item.cost.toString(), "ether"),
        image: item.product_image,
        stock: item.stock.toString(),
        category: item.product_category,
        specification: {
          color: item.specification.color,
          engine_power: item. specification.engine_power,
          fuel: item.specification.fuel,
          interior: item.specification.interior,
          mileage: item.specification.mileage,
          condition: item.specification.condition,
          cubic_capacity: item.specification.cubic_capacity,
        },
        highlights: item.highlights
      });
      setContextcars(cars);
    }
  
    return (
      <div>  
        <Navigation />
        <FooterNavigation />
 <div class="carrier-form-container">
  <div class="carrier-form">
    <div class="form-header">
      <h2>Sell Your Carrier</h2>
      <h3>Please enter the details of your carrier</h3>
    </div>
    <form onSubmit={handleSubmit}>
      <div class="form-group">
        <label>Carrier Name:</label>
        <input
          type="text"
          name="carrierName"
          value={formData.carrierName}
          onChange={handleInputChange}
          required
        />
      </div>
      <div class="form-group">
        <label>Carrier Type:</label>
        <select
          name="carrierType"
          value={formData.carrierType}
          onChange={handleInputChange}
          required
        >
          <option value="car">Car</option>
          <option value="boat">Boat</option>
          <option value="plane">Plane</option>
        </select>
      </div>
      <div class="form-group">
        <label>Registration Number:</label>
        <input
          type="text"
          name="registrationNumber"
          value={formData.registrationNumber}
          onChange={handleInputChange}
          required
        />
      </div>
      <div class="form-group">
        <label>Price (ETH):</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          min="0"
          step="0.01"
          required
        />
      </div>
      <div class="form-group">
        <label>Year:</label>
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleInputChange}
          min="1900"
          max={new Date().getFullYear()}
          required
        />
      </div>
      {error && <div class="error-message">{error}</div>}
      <div class="form-actions">
        <button
          type="submit"
          disabled={!account || isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Create Carrier Token'}
        </button>
      </div>
    </form>
    {!account && (
      <div class="wallet-warning">
        <p>Please connect your wallet first!</p>
      </div>
    )}
  </div>
</div>
      </div>
    );
};
export function TokenDetail() {
    return (<h1>TokenDetail</h1>);
}
export function Transactions() {
    return (<h1>Transactions</h1>);
}