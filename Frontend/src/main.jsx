import 'bootstrap/dist/css/bootstrap.min.css'
import "bootstrap-icons/font/bootstrap-icons.css";
import './index.css';
import './App.css';
import App from './App.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <BrowserRouter>
      <App />
    </BrowserRouter>
    
  </StrictMode>,
)


/* IMPORTS

npm install react react-dom
npm install leaflet
npm install @fontsource/roboto @fontsource/orbitron
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install @paypal/react-paypal-js
npm install crypto-js
npm install sweetalert2


paypal

sb-wxuwa47149727@personal.example.com

{b^9Mv<*

Para ver los test exitosos o fallidos (En CMD)

npx vitest run --reporter verbose 2>nul


*/