import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// YENİ EKLENEN:
import { BasketProvider } from './Context/BasketContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    {/* Uygulamayı BasketProvider ile sarıyoruz ki her yerden erişilsin */}
    <BasketProvider> 
      <App />
      <ToastContainer position="bottom-right" />
    </BasketProvider>
  </BrowserRouter>,
)