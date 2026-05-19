import axios from 'axios';

// URL Local (Via Ngrok para acesso remoto)
const LOCAL_URL = 'https://monoxide-untagged-hull.ngrok-free.dev/api/';

// URL de Produção (Render)
const PRODUCTION_URL = 'https://oat-desenvolvimento-mobile.onrender.com/api/';

const api = axios.create({
  baseURL: LOCAL_URL, // Trocado para LOCAL para você testar agora. Mude para PRODUCTION antes de gerar o APK final se o Render estiver ok.
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;
