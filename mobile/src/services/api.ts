import axios from 'axios';

// URL de Produção - Com barra no final (padrão correto para baseURL)
const PRODUCTION_URL = 'https://oat-desenvolvimento-mobile.onrender.com/api/';

const api = axios.create({
  baseURL: PRODUCTION_URL,
  timeout: 45000, // 45 segundos (Render pode ser lento para acordar)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;
