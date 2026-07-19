import axios, { AxiosError, AxiosInstance } from 'axios';
import type {
  ApiErrorShape,
  AuthResponse,
  ConfirmResponse,
  LoginPayload,
  MessageResponse,
  RegisterPayload,
  User,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'auth_user';

// Токен может лежать либо в localStorage (remember me),
// либо в sessionStorage (сессия только на время вкладки)
export function readToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Перехватчик запроса: подставляем Bearer-токен из хранилища на каждый запрос
api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик ответа: при 401 сбрасываем сессию и уводим на /login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearSession();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

// Приводим ошибку Nest к одной читаемой строке для тостов
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorShape | undefined;
    if (data?.message) {
      return Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message;
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Не удалось соединиться с сервером. Попробуйте позже.';
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Произошла неизвестная ошибка';
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload).then((r) => r.data),

  confirm: (token: string) =>
    api.post<ConfirmResponse>('/auth/confirm', { token }).then((r) => r.data),

  resendConfirmation: (email: string) =>
    api
      .post<MessageResponse>('/auth/resend-confirmation', { email })
      .then((r) => r.data),

  forgotPassword: (email: string) =>
    api
      .post<MessageResponse>('/auth/forgot-password', { email })
      .then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    api
      .post<MessageResponse>('/auth/reset-password', { token, password })
      .then((r) => r.data),
};

export const usersApi = {
  me: () => api.get<User>('/users/me').then((r) => r.data),

  updateMe: (payload: { firstName?: string; lastName?: string }) =>
    api.patch<User>('/users/me', payload).then((r) => r.data),
};
