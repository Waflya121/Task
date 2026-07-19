import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AuthContextValue,
  LoginPayload,
  RegisterPayload,
  User,
} from '../types';
import {
  authApi,
  clearSession,
  TOKEN_KEY,
  USER_KEY,
  usersApi,
} from '../services/api';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Сохраняем сессию с учётом "запомнить меня":
 * remember === true  -> localStorage (переживает закрытие браузера)
 * remember === false -> sessionStorage (живёт только пока открыта вкладка)
 * Перед записью всегда чистим оба хранилища, чтобы не было двух источников токена.
 */
function persistSession(token: string, user: User, remember: boolean): void {
  clearSession();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

function readStoredUser(): User | null {
  const raw =
    localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function updateStoredUser(user: User): void {
  if (localStorage.getItem(USER_KEY)) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else if (sessionStorage.getItem(USER_KEY)) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => readStoredUser());
  const [loading, setLoading] = useState<boolean>(true);

  // При старте приложения, если есть токен, подтягиваем свежий профиль с бэкенда
  useEffect(() => {
    const bootstrap = async () => {
      const stored = readStoredUser();
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        const fresh = await usersApi.me();
        setUserState(fresh);
        updateStoredUser(fresh);
      } catch {
        // 401 обработает перехватчик; здесь просто гасим загрузку
      } finally {
        setLoading(false);
      }
    };
    void bootstrap();
  }, []);

  const login = useCallback(
    async (payload: LoginPayload, remember: boolean): Promise<User> => {
      const { accessToken, user: loggedUser } = await authApi.login(payload);
      persistSession(accessToken, loggedUser, remember);
      setUserState(loggedUser);
      return loggedUser;
    },
    [],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<User> => {
      const { accessToken, user: newUser } = await authApi.register(payload);
      // Регистрация сразу логинит пользователя. По умолчанию помним сессию.
      persistSession(accessToken, newUser, true);
      setUserState(newUser);
      return newUser;
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setUserState(null);
  }, []);

  const setUser = useCallback((next: User) => {
    setUserState(next);
    updateStoredUser(next);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      register,
      logout,
      setUser,
    }),
    [user, loading, login, register, logout, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
