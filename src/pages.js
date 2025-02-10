import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEthereum } from './EthereumContext';

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
    const { account, contract } = useEthereum();
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
          price: ethers.parseEther(formData.price.toString()), // Convert to wei
          year: formData.year,
          txSucCount: 0
        };
  
        // Send transaction
        const tx = await contract.mintToken(carrierData); // 假設合約有addCarrier方法
        await tx.wait();
        
        // Reset form
        setFormData({
          carrierName: '',
          registrationNumber: '',
          price: 0,
          year: new Date().getFullYear()
        });
        
        alert('Carrier Token created successfully!');
      } catch (err) {
        console.error('Contract call failed:', err);
        setError(err.message || 'Failed to create carrier');
      } finally {
        setIsSubmitting(false);
      }
    };
  
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