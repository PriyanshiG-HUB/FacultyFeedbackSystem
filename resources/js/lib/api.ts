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
  role: 'SUPER_ADMIN' | 'ADMIN' | 'FACULTY' | 'HOD' | 'STUDENT';
  canonical_role?: string;
  is_hod?: boolean;
  hod_department_id?: number | null;
  hod_department_code?: string | null;
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
  window.dispatchEvent(new CustomEvent('auth:logout'));
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

export function redirectToLogin(redirectHash?: string): void {
  const storedUser = getStoredUserInfo();
  const currentHash = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0];
  const isStudentContext = currentHash.startsWith('Student/') || storedUser?.role === 'STUDENT';
  const defaultTarget = isStudentContext ? '#Student/Identify' : '#Faculty/Login';
  const target = redirectHash || defaultTarget;
  const cleanTarget = target.startsWith('#') ? target : `#${target}`;

  window.location.hash = cleanTarget;
  const targetUrl = `${window.location.origin}${window.location.pathname}${cleanTarget}`;
  window.location.replace(targetUrl);
  window.location.reload();
}

export function handle401Redirect(): void {
  removeAuthToken();

  if (isRedirectingToLogin) return;
  isRedirectingToLogin = true;

  const currentHash = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0];

  // Only redirect if not already on login/identify pages
  if (currentHash !== 'Faculty/Login' && currentHash !== 'Student/Identify') {
    const target = currentHash.startsWith('Student/') ? '#Student/Identify' : '#Faculty/Login';
    redirectToLogin(target);
  }

  setTimeout(() => {
    isRedirectingToLogin = false;
  }, 1000);
}

export async function handleLogout(redirectHash?: string): Promise<void> {
  const token = getAuthToken();
  const storedUser = getStoredUserInfo();
  const currentHash = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0];
  const isStudentContext = currentHash.startsWith('Student/') || storedUser?.role === 'STUDENT';
  const defaultTarget = isStudentContext ? '#Student/Identify' : '#Faculty/Login';
  const target = redirectHash || defaultTarget;

  try {
    if (token) {
      await api.post('/auth/logout');
    }
  } catch (error: any) {
    console.warn('Backend logout API request failed or timed out (proceeding to clear client session):', error);
  } finally {
    removeAuthToken();
    redirectToLogin(target);
  }
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
  options: RequestInit & { timeoutMs?: number; params?: Record<string, any> } = {}
): Promise<T> {
  let { url, isExternal } = buildApiUrl(endpoint);

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  let requestBody = options.body;

  if (requestBody instanceof FormData) {
    // For FormData, remove any Content-Type header so fetch/browser sets boundary automatically
    Object.keys(headers).forEach((h) => {
      if (h.toLowerCase() === 'content-type') {
        delete headers[h];
      }
    });
  } else if (requestBody !== undefined && requestBody !== null) {
    if (typeof requestBody !== 'string') {
      requestBody = JSON.stringify(requestBody);
    }
    const hasContentType = Object.keys(headers).some((h) => h.toLowerCase() === 'content-type');
    if (!hasContentType) {
      headers['Content-Type'] = 'application/json';
    }
  }

  if (token && !isExternal) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const timeoutMs = options.timeoutMs ?? 60000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      body: requestBody,
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
      removeAuthToken();
      const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/logout');
      if (!isAuthEndpoint) {
        handle401Redirect();
      }
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
  get: <T = any>(endpoint: string, options?: RequestInit & { timeoutMs?: number; params?: Record<string, any> }) =>
    apiRequest<T>(endpoint, { method: 'GET', ...options }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestInit & { timeoutMs?: number; params?: Record<string, any> }) =>
    apiRequest<T>(endpoint, { method: 'POST', body, ...options }),
  postForm: <T = any>(endpoint: string, formData: FormData, options?: RequestInit & { timeoutMs?: number; params?: Record<string, any> }) =>
    apiRequest<T>(endpoint, { method: 'POST', body: formData, ...options }),
  put: <T = any>(endpoint: string, body?: any, options?: RequestInit & { timeoutMs?: number; params?: Record<string, any> }) =>
    apiRequest<T>(endpoint, { method: 'PUT', body, ...options }),
  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit & { timeoutMs?: number; params?: Record<string, any> }) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body, ...options }),
  delete: <T = any>(endpoint: string, options?: RequestInit & { timeoutMs?: number; params?: Record<string, any> }) =>
    apiRequest<T>(endpoint, { method: 'DELETE', ...options }),
};
