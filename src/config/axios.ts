import axios from 'axios';
import type { AxiosInstance, AxiosError,  InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// interface ApiResponse<T = any> {
//   data: T;
//   status: number;
//   statusText: string;
// }

interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 35000,
});

const guestApi: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 30000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { guestApi };
export default api;
