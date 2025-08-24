import axios from 'axios';
import { API_ENDPOINTS } from '../constants';

const apiClient = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // TODO: 토큰이 있으면 Authorization 헤더 추가
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('=== API Error ===');
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method);
    console.error('Data:', error.config?.data);
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);
    console.error('Message:', error.message);
    console.error('=================');
    return Promise.reject(error);
  }
);

export default apiClient;