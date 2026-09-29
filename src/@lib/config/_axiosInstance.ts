import { Env } from '.environments';
import { IBaseResponse } from '@base/interfaces';
import { getNotificationInstance } from '@lib/utils';
import { getAuthToken, refreshAuthToken } from '@modules/auth/lib/utils/client';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const getApiErrorMessage = (error: AxiosError): string => {
  const data = error.response?.data as { message?: unknown; error?: unknown } | undefined;
  const apiMessage = data?.message;

  if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;
  if (Array.isArray(apiMessage)) {
    const messages = apiMessage.filter((item): item is string => typeof item === 'string' && !!item.trim());
    if (messages.length) return messages.join('\n');
  }
  if (typeof data?.error === 'string' && data.error.trim()) return data.error;
  return error.response?.statusText || error.message || 'Request failed. Please try again.';
};

const notifyApiError = (error: AxiosError): void => {
  if (axios.isCancel(error)) return;

  const errorMessage = getApiErrorMessage(error);
  try {
    getNotificationInstance().error({
      key: `api-error-${error.response?.status ?? 'network'}-${errorMessage.slice(0, 80)}`,
      message: errorMessage,
    });
  } catch {
    // Requests can fail before the app-level notification holder mounts.
  }
};

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
    notifyApiError(error);
    return Promise.reject(error);
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

      notifyApiError(error);
      
      // Only redirect if not already on auth page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
      
      return Promise.reject(error);
    }

    notifyApiError(error);
    return Promise.reject(error);
  },
);
