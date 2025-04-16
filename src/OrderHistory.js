import React, { useState, useEffect } from 'react';
import { useEthereum } from './EthereumContext';
import Navigation from './components/Navigation';
import FooterNavigation from './components/FooterNavigation';
import { ethers } from 'ethers';
import CarrierApp from './abis/CarrierApp.json';
import config from './config.json';
import Gun from 'gun';
import './OrderHistory.css';
import { useNavigate } from 'react-router-dom';

const gun = Gun();

const OrderHistory = () => {
  const { account } = useEthereum();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (!account) {
        setError('Please connect your wallet to view your order history.');
        setLoading(false);
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();

        if (!config[chainId]?.CarrierApp?.address) {
          setError('Unsupported network! Please switch to a supported network.');
          setLoading(false);
          return;
        }

        const carrierapp = new ethers.Contract(
          config[chainId].CarrierApp.address,
          CarrierApp,
          provider
        );

        const orderCount = await carrierapp.getOrderCount(account);
        const orderList = [];

        for (let i = 1; i <= orderCount; i++) {
          const order = await carrierapp.getOrder(account, i);
          const item = await carrierapp.getProduct(order.item_id);

          let txHash = 'Not available';
          let orderTime = Number(order.time) * 1000;
          const userOrdersNode = gun.get(`user_${account}`).get('orders');
          await new Promise((resolve) => {
            userOrdersNode.get(i.toString()).once((data) => {
              if (data && data.orderTime) {
                txHash = data.txHash || 'Not available';
                const parsedTime = new Date(data.orderTime);
                if (!isNaN(parsedTime.getTime())) {
                  orderTime = parsedTime.getTime();
                } else {
                  console.warn(`Invalid orderTime for order ${i}:`, data.orderTime);
                }
              }
              resolve();
            });
          });

          orderList.push({
            orderId: i,
            item,
            orderTime,
            txHash,
          });
        }

        setOrders(orderList);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load order history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [account]);

  return (
    <div className="order-history-page">
      <Navigation />
      <main className="order-history-main">
        <div className="order-history-container">
          <div className="order-history-header">
            <button
              onClick={() => navigate(-1)}
              className="back-button"
              aria-label="Go back"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h2>Order History</h2>
          </div>
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading orders...</p>
            </div>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : orders.length === 0 ? (
            <p className="no-orders">No orders found.</p>
          ) : (
            <>
              <div className="order-summary">
                <p>Total Orders: {orders.length}</p>
              </div>
              <div className="order-list">
                {orders.map((order) => (
                  <div key={order.orderId} className="order-card">
                    <div className="order-details">
                      <h3 className="order-title">{order.item.name}</h3>
                      <p className="order-id">Order ID: {order.orderId}</p>
                      <p className="order-cost">
                        Cost: {ethers.formatEther(order.item.cost)} ETH
                      </p>
                      <p className="order-time">
                        Ordered At:{' '}
                        {isNaN(new Date(order.orderTime).getTime())
                          ? 'Unknown'
                          : new Date(order.orderTime).toLocaleString()}
                      </p>
                      <p className="order-tx-hash">
                        Transaction Hash:{' '}
                        {order.txHash !== 'Not available' ? (
                          <a
                            href={`https://etherscan.io/tx/${order.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tx-hash-link"
                          >
                            {order.txHash.slice(0, 6)}...{order.txHash.slice(-4)}
                          </a>
                        ) : (
                          'Not available'
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <FooterNavigation />
    </div>
  );
};

export default OrderHistory;