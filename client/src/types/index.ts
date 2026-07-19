// Форма пользователя строго соответствует контракту бэкенда
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  isEmailConfirmed: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}

export interface ConfirmResponse {
  message: string;
  confirmed: true;
}

export interface RegisterPayload {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Nest возвращает ошибки в таком виде; message может быть массивом (class-validator)
export interface ApiErrorShape {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload, remember: boolean) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
}
