import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor para injetar cabeçalhos em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (userId) {
      config.headers['X-User-Id'] = userId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
