import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { CustomerProvider } from './customer/useCustomer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <CustomerProvider>
          <CartProvider>
            <App />
            <CartDrawer />
          </CartProvider>
        </CustomerProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
