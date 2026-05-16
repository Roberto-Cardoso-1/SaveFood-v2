import axios from 'axios';
import { Platform } from 'react-native';

// No Android Emulator, 10.0.2.2 aponta para o localhost da máquina host
// No iOS e Web, usamos localhost normalmente
const getBaseUrl = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000/api/';
  return 'http://127.0.0.1:8000/api/';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
