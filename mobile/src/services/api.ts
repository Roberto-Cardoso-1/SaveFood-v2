import axios from 'axios';

// URL de Produção Validada
const PRODUCTION_URL = 'https://oat-desenvolvimento-mobile.onrender.com/api/';

const api = axios.create({
  baseURL: PRODUCTION_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;
