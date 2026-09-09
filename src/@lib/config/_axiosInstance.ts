import { Env } from '.environments';
import { IBaseResponse } from '@base/interfaces';
import { getNotificationInstance } from '@lib/utils';
import { getAuthToken, refreshAuthToken } from '@modules/auth/lib/utils/client';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const requestInterceptorFn = (config: InternalAxiosRequestConfig) => {
  // No scope manipulation needed since base URL already includes internal scope
  if (config?.scope) delete config.scope;

  return config;
};

// Axios Instance
export const AxiosInstance = axios.create({
  baseURL: Env.apiUrl,
  headers: {
    'Time-Zone-Offset': -new Date().getTimezoneOffset(),
  },
});

AxiosInstance.interceptors.request.use(requestInterceptorFn, (error: AxiosError) => Promise.reject(error));

AxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<IBaseResponse>) => {
    const notification = getNotificationInstance();

    if (error.config.method === 'get') {
      notification.error({ message: error.response?.data?.message || error.response?.statusText });
    }

    return error.response;
  },
);

// Axios Instance (Secure)
export const AxiosSecureInstance = axios.create({
  ...AxiosInstance.defaults,
});

AxiosSecureInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config = requestInterceptorFn(config) as InternalAxiosRequestConfig;
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

AxiosSecureInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<IBaseResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried, try refreshing the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshSuccess = await refreshAuthToken();
        if (refreshSuccess) {
          // Retry the original request with the new token
          const newToken = getAuthToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return AxiosSecureInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        console.error('Token refresh failed:', refreshError);
      }

      // Refresh failed, clear session and redirect to login
      const { clearAuthSession } = await import('@modules/auth/lib/utils/client');
      clearAuthSession();
      
      // Only redirect if not already on auth page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
      
      return Promise.reject(error);
    }

    const notification = getNotificationInstance();

    if (error.response?.status === 403) {
      notification.error({ message: error.response?.data?.message || error.response?.statusText });
    } else if (error.config.method === 'get') {
      notification.error({ message: error.response?.data?.message || error.response?.statusText });
    }

    return Promise.reject(error);
  },
);
