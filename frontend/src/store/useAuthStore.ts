import { create } from 'zustand';
import { login as apiLogin } from '../api/auth';

const TOKEN_KEY = 'pet_access_token';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loginError: string | null;
  isLoggingIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

function loadToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch { /* noop */ }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch { /* noop */ }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: loadToken(),
  isAuthenticated: !!loadToken(),
  loginError: null,
  isLoggingIn: false,

  login: async (email, password) => {
    set({ loginError: null, isLoggingIn: true });
    try {
      const res = await apiLogin(email, password);
      const token = res.data.accessToken;
      saveToken(token);
      set({ token, isAuthenticated: true, loginError: null, isLoggingIn: false });
      return true;
    } catch {
      set({ loginError: 'Login fehlgeschlagen', isLoggingIn: false });
      return false;
    }
  },

  logout: () => {
    clearToken();
    set({ token: null, isAuthenticated: false, loginError: null });
  },
}));
