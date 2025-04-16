import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Regis from "./Regis";
import ProfileP from "./ProfileP";
import Search from "./Search";
import reportWebVitals from './reportWebVitals';
import Buy from './Buy';
import Cart from './Cart';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AllTokens, MintToken, TokenDetail, Transactions } from './pages';
import { EthereumProvider } from './EthereumContext';
import { CartProvider } from './CartContext'; // Import CartProvider
import ProductDetail from './components/Product';
import Checkout from './Checkout';
import OrderHistory from './OrderHistory';
import Sell from './Sell';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/allTokens",
    element: <AllTokens />
  },
  {
    path: "/mint",
    element: <MintToken />
  },
  {
    path: "/token/:tokenId",
    element: <TokenDetail />
  },
  {
    path: "/transactions/:tokenId",
    element: <Transactions />
  },
  {
    path: "/Regis",
    element: <Regis />
  },
  {
    path: "/ProfileP",
    element: <ProfileP />
  },
  {
    path: "/Search",
    element: <Search />
  },
  {
    path: "/Buy",
    element: <Buy />
  },
  {
    path: "/product/:productId",
    element: <ProductDetail />
  },
  {
    path: "/Cart",
    element: <Cart />
  },
  {
    path: "/Checkout",
    element: <Checkout />
  },
  {
    path: "/Order-History",
    element: <OrderHistory />
  },
  {
    path: "/Sell",
    element: <Sell />
  }
]);

root.render(
  <React.StrictMode>
    <EthereumProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </EthereumProvider>
  </React.StrictMode>
);

reportWebVitals();