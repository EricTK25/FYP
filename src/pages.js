import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEthereum } from './EthereumContext';
const Gun = require('gun');
import config from './config.json';
import CarrierApp from './abis/CarrierApp.json';

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
    const { account, contextcars, setContextcars } = useEthereum();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [provider, setProvider] = useState(null);
    const [carrierApp, setCarrierApp] = useState(null);

    const [formData, setFormData] = useState({
        carrierName: '',
        carrierType: 'car',
        registrationNumber: '',
        price: 0,
        year: new Date().getFullYear()
    });

    useEffect(() => {
        const initBlockchain = async () => {
            try {
                if (!window.ethereum) {
                    setError("MetaMask is not installed");
                    return;
                }

                const provider = new ethers.BrowserProvider(window.ethereum);
                const network = await provider.getNetwork();
                const chainId = network.chainId.toString();

                if (!config[chainId]?.CarrierApp?.address) {
                    setError(`Contract not deployed on network ${chainId}`);
                    return;
                }

                const carrierApp = new ethers.Contract(
                    config[chainId].CarrierApp.address,
                    CarrierApp,
                    provider
                );

                setProvider(provider);
                setCarrierApp(carrierApp);
            } catch (err) {
                console.error("Error initializing blockchain:", err);
                setError("Failed to connect to blockchain");
            }
        };

        initBlockchain();
    }, []);

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

        if (!account) {
            alert('Please connect your wallet first!');
            return;
        }

        if (!carrierApp || !provider) {
            setError('Blockchain not initialized');
            return;
        }

        try {
            setIsSubmitting(true);

            const signer = await provider.getSigner();
            const contractWithSigner = carrierApp.connect(signer);

            const itemStruct = {
                product_id: 0, // Ignored by contract; ID is auto-generated
                name: formData.carrierName,
                category: formData.carrierType,
                image: 'https://purepng.com/public/uploads/large/black-edition-audi-luxury-car-1nm.png',
                cost: ethers.parseEther(formData.price.toString()),
                stock: 1,
                highlights: `Registration: ${formData.registrationNumber}, Year: ${formData.year}`
            };

            const specStruct = {
                color: "Black",
                engine_power: "200 HP",
                fuel: "Petrol",
                interior: "Leather",
                mileage: "0 km",
                condition: "New",
                cubic_capacity: "2.0L"
            };

            const tx = await contractWithSigner.list(itemStruct, specStruct);
            const receipt = await tx.wait();
            
            // Extract product_id from List event
            const listEvent = receipt.logs
                .map(log => {
                    try {
                        return contractWithSigner.interface.parseLog(log);
                    } catch {
                        return null;
                    }
                })
                .find(log => log && log.name === 'List');
            const productId = listEvent ? listEvent.args.id.toString() : Date.now().toString();

            // Insert into Gun.js
            await insertIntoGun({
                id: productId,
                name: formData.carrierName,
                category: formData.carrierType,
                image: itemStruct.image,
                cost: formData.price.toString(),
                stock: "1",
                specification: specStruct,
                highlights: itemStruct.highlights
            });

            // Update contextcars
            setItemToContextcars({
                id: productId,
                name: formData.carrierName,
                category: formData.carrierType,
                image: itemStruct.image,
                cost: formData.price.toString(),
                stock: "1",
                specification: specStruct,
                highlights: itemStruct.highlights
            });

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
            setError(err.reason || err.message || 'Failed to create carrier');
        } finally {
            setIsSubmitting(false);
        }
    };

    const insertIntoGun = (item) => {
        return new Promise((resolve, reject) => {
            const gun = Gun({ peers: ['http://localhost:8765/gun'] });
            gun.get('carrierlist').get(item.id).put(item, (ack) => {
                if (ack.err) {
                    console.error(`Error inserting item ${item.id}:`, ack.err);
                    reject(ack.err);
                } else {
                    console.log(`Inserted product ID ${item.id}: ${item.name}`);
                    resolve();
                }
            });
        });
    };

    const setItemToContextcars = (item) => {
        const cars = [...contextcars];
        cars.push({
            id: item.id,
            name: item.name,
            cost: item.cost,
            image: item.image,
            stock: item.stock,
            category: item.category,
            specification: item.specification,
            highlights: item.highlights
        });
        setContextcars(cars);
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
                    disabled={!account || isSubmitting || !carrierApp}
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
}

export function TokenDetail() {
    return (<h1>TokenDetail</h1>);
}

export function Transactions() {
    return (<h1>Transactions</h1>);
}