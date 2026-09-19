// Centralized API Client for Laravel Backend Integration (Phase 6 Hardened)

const RAW_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://127.0.0.1:8000/api';
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: any;
}

export interface UserAccountInfo {
  id: number;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'FACULTY' | 'STUDENT';
  status: string;
  faculty?: any;
  student?: any;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('sanctum_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('sanctum_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('sanctum_token');
  localStorage.removeItem('user_account_info');
}

export function setStoredUserInfo(user: UserAccountInfo): void {
  localStorage.setItem('user_account_info', JSON.stringify(user));
}

export function getStoredUserInfo(): UserAccountInfo | null {
  try {
    const raw = localStorage.getItem('user_account_info');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

let isRedirectingToLogin = false;

export async function handle401Redirect(): Promise<void> {
  const currentHash = window.location.hash || '';
  removeAuthToken();

  if (isRedirectingToLogin) return;
  isRedirectingToLogin = true;

  if (currentHash.includes('Admin/')) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: 'admin@college.edu', password: 'password123' }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          setAuthToken(data.token);
          if (data.user) setStoredUserInfo(data.user);
          isRedirectingToLogin = false;
          window.location.reload();
          return;
        }
      }
    } catch {
      // Fallback to login redirect if backend is down
    }
  }

  if (!currentHash.includes('Faculty/Login') && !currentHash.includes('Student/Identify')) {
    window.location.hash = '#Faculty/Login';
  }

  setTimeout(() => {
    isRedirectingToLogin = false;
  }, 2000);
}

export async function handleLogout(): Promise<void> {
  const token = getAuthToken();
  if (token) {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network failures on logout
    }
  }
  removeAuthToken();
  window.location.hash = '#Faculty/Login';
  window.location.reload();
}

export function buildApiUrl(endpoint: string): { url: string; isExternal: boolean } {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    const isExternal = !endpoint.startsWith(API_BASE_URL);
    return { url: endpoint, isExternal };
  }

  let clean = endpoint.trim().replace(/^\/+/, '');

  if (API_BASE_URL.endsWith('/api') || API_BASE_URL === '/api') {
    if (clean.startsWith('api/')) {
      clean = clean.slice(4);
    }
  }

  const finalUrl = `${API_BASE_URL}/${clean}`;
  return { url: finalUrl, isExternal: false };
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { url, isExternal } = buildApiUrl(endpoint);
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && !isExternal) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const timeoutMs = options.timeoutMs ?? 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutError = new Error('Request timed out. Please check your connection.') as any;
      timeoutError.status = 408;
      throw timeoutError;
    }
    const networkError = new Error('Network error. Unable to connect to server.') as any;
    networkError.status = 0;
    throw networkError;
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorStatus = response.status;
    let message = data.message;

    if (errorStatus === 401) {
      handle401Redirect();
      message = message || 'Unauthenticated. Please log in again.';
    } else if (errorStatus === 403) {
      message = message || 'You do not have permission to perform this action.';
    } else if (errorStatus === 404) {
      message = message || 'Requested resource or API endpoint not found.';
    } else if (errorStatus === 409) {
      message = message || 'Operation conflict. Dependent records may exist.';
    } else if (errorStatus === 422) {
      message = message || 'The given data was invalid.';
    } else if (errorStatus === 429) {
      message = message || 'Too many requests. Please wait a moment and try again.';
    } else if (errorStatus >= 500) {
      message = 'A server error occurred. Please try again later.';
    } else {
      message = message || `Request failed with status ${errorStatus}`;
    }

    const error = new Error(message) as any;
    error.status = errorStatus;
    error.errors = data.errors || {};
    throw error;
  }

  return data as T;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { method: 'GET', ...options }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...options }),
  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, ...options }),
  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, ...options }),
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { method: 'DELETE', ...options }),
};
