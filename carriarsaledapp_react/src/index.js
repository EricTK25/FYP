import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Regis from "./Regis";
import ProfileP from "./ProfileP";
import Search from "./Search";
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MyTokens, MintToken, TokenDetail, Transactions} from './pages';
import { EthereumProvider } from './EthereumContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/my-tokens",
    element: <MyTokens />
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
  }
]);

root.render(
  <React.StrictMode>
    <EthereumProvider>
      <RouterProvider router={router} />
    </EthereumProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();