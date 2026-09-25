import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import './index.css';
import './App.css';
import App from './App.jsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig, loginRequest } from "./authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.initialize().then(async () => {
  try {
    // 1. Procesar el resultado de la redirección
    const redirectResponse = await msalInstance.handleRedirectPromise();

    // 2. Determinar la cuenta activa
    let account = redirectResponse?.account || msalInstance.getAllAccounts()[0];

    if (account) {
      msalInstance.setActiveAccount(account);

      // 3. Adquirir explícitamente el token para la API de Pedidos360
      try {
        const tokenResponse = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: account,
        });

        if (tokenResponse?.accessToken) {
          localStorage.setItem("token", tokenResponse.accessToken);
        }
      } catch (tokenErr) {
        console.warn("Silent token falló en main.jsx:", tokenErr);
      }

      // 4. Guardar datos de usuario para el navbar/perfil
      const usuarioAzure = {
        nombre: account.name || account.username,
        email: account.username,
        rol: "Cliente",
      };
      localStorage.setItem("usuario", JSON.stringify(usuarioAzure));
    }
  } catch (err) {
    console.error("Error inicializando autenticación MSAL:", err);
  }

  // Renderizar la aplicación una vez asegurado el token
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MsalProvider>
    </StrictMode>
  );
});