import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import {
  getFirebaseAuth,
  isFirebaseConfigured,
  onAuthChange,
  signInWithEmail,
  registerWithEmail,
  resetPassword as fbResetPassword,
  signOut as fbSignOut,
  getIdToken,
} from "@/lib/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  isFirebaseReady: boolean;
  isAdmin: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthState | null>(null);

const ADMIN_UID =
  (import.meta.env.VITE_ADMIN_UID as string | undefined) || "k7ImnQ5eSwVDVJsL4hTRW9HSyRl1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isFirebaseReady = isFirebaseConfigured();

  useEffect(() => {
    if (!isFirebaseReady) {
      setLoading(false);
      return;
    }
    const unsub = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        getIdToken()
          .then((tok) => {
            if (!tok) return;
            return fetch("/api/me/touch", {
              method: "POST",
              headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
              body: "{}",
            });
          })
          .catch(() => {});
      }
    });
    return () => unsub();
  }, [isFirebaseReady]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      isFirebaseReady,
      isAdmin: !!user && user.uid === ADMIN_UID,
      signInEmail: async (email: string, password: string) => {
        await signInWithEmail(email, password);
      },
      register: async (email: string, password: string, displayName?: string) => {
        await registerWithEmail(email, password, displayName);
      },
      resetPassword: async (email: string) => {
        await fbResetPassword(email);
      },
      signOut: async () => {
        await fbSignOut();
      },
      getToken: () => (getFirebaseAuth()?.currentUser ? getIdToken() : Promise.resolve(null)),
    }),
    [user, loading, isFirebaseReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
