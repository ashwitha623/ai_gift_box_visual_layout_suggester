import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import axios from 'axios'

// Global Axios Request Interceptor for Role/ID headers and API Base URL replacement
axios.interceptors.request.use(
  (config) => {
    // If a remote VITE_API_URL is configured, rewrite localhost:5000 requests to it
    const apiBase = import.meta.env.VITE_API_URL;
    if (apiBase && config.url && config.url.startsWith("http://localhost:5000")) {
      config.url = config.url.replace("http://localhost:5000", apiBase);
    }

    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.id) config.headers["x-user-id"] = user.id;
      if (user.role) config.headers["x-user-role"] = user.role;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
