import { useAuthStore } from './store/auth.store.js';

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(message: string, statusCode: number, code = 'API_ERROR', details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api/v1'
    : 'http://localhost:5000/api/v1');

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const activeOrgId = useAuthStore.getState().activeOrgId;
  if (activeOrgId && !headers.has('X-Organization-Id')) {
    headers.set('X-Organization-Id', activeOrgId);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new ApiError(
      networkError instanceof Error ? networkError.message : 'Network connection failed',
      0,
      'NETWORK_ERROR',
    );
  }

  // Handle 401 Unauthorized token rotation
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(request<T>(endpoint, options)),
          reject: (err) => reject(err),
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!refreshRes.ok) {
        throw new Error('Session expired');
      }

      processQueue(null);
      return request<T>(endpoint, options);
    } catch (refreshErr) {
      processQueue(refreshErr instanceof Error ? refreshErr : new Error('Refresh failed'));
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
      throw new ApiError('Session expired. Please log in again.', 401, 'UNAUTHORIZED');
    } finally {
      isRefreshing = false;
    }
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      data && typeof data === 'object' && 'error' in data
        ? data.error.message || 'Request failed'
        : 'Request failed';
    const errorCode =
      data && typeof data === 'object' && 'error' in data
        ? data.error.code || 'API_ERROR'
        : 'API_ERROR';
    const errorDetails =
      data && typeof data === 'object' && 'error' in data ? data.error.details : undefined;

    throw new ApiError(errorMessage, response.status, errorCode, errorDetails);
  }

  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return data.data as T;
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
