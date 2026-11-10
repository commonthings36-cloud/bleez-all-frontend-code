import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { enqueueSnackbar } from 'notistack';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://13.232.176.192:4545/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Error Handling & 401 Session Handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    if (status === 401) {
      enqueueSnackbar('Session expired or unauthorized. Please log in.', { variant: 'warning' });
      store.dispatch(logout());
    } else if (status === 403) {
      enqueueSnackbar('You do not have permission to access this resource.', { variant: 'error' });
    } else if (status >= 500) {
      enqueueSnackbar(`Server Error (${status}): ${message}`, { variant: 'error' });
    }

    return Promise.reject(error);
  }
);
