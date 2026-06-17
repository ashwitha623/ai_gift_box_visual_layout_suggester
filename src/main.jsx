import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import axios from 'axios'

// Global Axios Request Interceptor for Role/ID headers
axios.interceptors.request.use(
  (config) => {
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
