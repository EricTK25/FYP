import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEthereum } from './EthereumContext';
const Gun = require('gun');
const insertData = require('./Config/insertData.js');

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
    const {account, contract, productCount, setProductCount, Contextcars, setContextcars} = useEthereum();
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
      const cars = Contextcars;
      cars.push({
        id: item.product_id.toString(),
        name: item.product_name,
        cost: ethers.formatUnits(item.cost.toString(), "ether"),
        image: item.product_image,
        stock: item.stock.toString(),
        category: item.product_category
      });
      setContextcars(cars);
    }
  
    return (
      <div className="carrier-form">
        <h2>Create New Carrier</h2>
        
        {account && <p>Connected Account: {account}</p>}
  
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Carrier Name:</label>
            <input
              type="text"
              name="carrierName"
              value={formData.carrierName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
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
  
          <div className="form-group">
            <label>Registration Number:</label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              required
            />
          </div>
  
          <div className="form-group">
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
  
          <div className="form-group">
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
  
          {error && <div className="error-message">{error}</div>}
  
          <button 
            type="submit" 
            disabled={!account || isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Create Carrier Token'}
          </button>
        </form>
  
        {!account && (
          <div className="wallet-warning">
            <p>Please connect your wallet first!</p>
          </div>
        )}
      </div>
    );
};
export function TokenDetail() {
    return (<h1>TokenDetail</h1>);
}
export function Transactions() {
    return (<h1>Transactions</h1>);
}