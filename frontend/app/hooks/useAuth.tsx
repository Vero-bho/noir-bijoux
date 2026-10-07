import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { LoginFormValues, RegisterFormValues, User } from "~/types";
import { STORAGE_KEYS, readStorage, removeStorage, writeStorage } from "~/lib/storage";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (values: LoginFormValues) => { ok: boolean; message?: string };
  register: (values: RegisterFormValues) => { ok: boolean; message?: string };
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const DEMO_CREDENTIALS = { email: "olga@mail.com", password: "noir1234" };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readStorage<User | null>(STORAGE_KEYS.user, null));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (user) writeStorage(STORAGE_KEYS.user, user);
    else removeStorage(STORAGE_KEYS.user);
  }, [user, ready]);

  const login = useCallback((values: LoginFormValues) => {
    const email = values.email.trim().toLowerCase();
    if (email === DEMO_CREDENTIALS.email && values.password === DEMO_CREDENTIALS.password) {
      setUser({ id: 1, fullName: "Ольга", email: DEMO_CREDENTIALS.email, phone: "+7 999 000-00-00" });
      return { ok: true };
    }
    if (values.password.length >= 4) {
      setUser({ id: Date.now(), fullName: "Ольга", email });
      return { ok: true };
    }
    return { ok: false, message: "Неверный e-mail или пароль" };
  }, []);

  const register = useCallback((values: RegisterFormValues) => {
    setUser({
      id: Date.now(),
      fullName: values.fullName,
      email: values.email.trim().toLowerCase(),
      phone: values.phone,
    });
    return { ok: true };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const updateProfile = useCallback((patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value: AuthContextValue = {
    user,
    ready,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth должен использоваться внутри <AuthProvider>");
  }
  return context;
}
