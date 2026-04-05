import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { TOKEN_KEY } from '../api/apiClient';
import { AuthResponse, LoginRequest, RegisterRequest, UserRole } from '../api/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

const USER_KEY = 'doordrop_user';

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from AsyncStorage on app start
  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch {
        // corrupted storage — clear it
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = async (res: AuthResponse) => {
    const authUser: AuthUser = {
      userId: res.userId,
      name: res.name,
      email: res.email,
      role: res.role,
    };
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, res.token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(authUser)),
    ]);
    setToken(res.token);
    setUser(authUser);
  };

  const login = useCallback(async (email: string, password: string) => {
    const loginRequest: LoginRequest = { email, password };
    const { data } = await apiClient.post<AuthResponse>('/api/auth/login', loginRequest);
    await persist(data);
  }, []);

  const register = useCallback(async (registerData: RegisterRequest) => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/register', registerData);
    await persist(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // ignore — proceed with local cleanup regardless
    }
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
