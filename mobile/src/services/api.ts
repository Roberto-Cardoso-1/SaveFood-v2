import axios from 'axios';

// URL de Produção - Sem barra no final para evitar conflitos de rota
const PRODUCTION_URL = 'https://oat-desenvolvimento-mobile.onrender.com/api';

const api = axios.create({
  baseURL: PRODUCTION_URL,
  timeout: 30000, // 30 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;
