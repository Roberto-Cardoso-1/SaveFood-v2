import axios from 'axios';

// URL de Produção obtida do Render
const PRODUCTION_URL = 'https://oat-desenvolvimento-mobile.onrender.com/api/';

const api = axios.create({
  baseURL: PRODUCTION_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
