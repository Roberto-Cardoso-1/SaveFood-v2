import axios from 'axios';

// URL de Produção - Render
const PRODUCTION_URL = 'https://oat-desenvolvimento-mobile.onrender.com/api/';

const api = axios.create({
  baseURL: PRODUCTION_URL,
  timeout: 60000, // 60 segundos (Render pode demorar a acordar no plano free)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;
