// src/api/axiosConfig.js
import axios from 'axios';


const API_URL = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); 
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access - 401 received. Logging out.');
      
      localStorage.removeItem('authToken');
   
    }
    return Promise.reject(error);
  }
);


export default api;