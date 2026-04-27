import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  type Auth,
  type User,
} from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function isFirebaseConfigured(): boolean {
  return !!(config.apiKey && config.authDomain && config.projectId && config.appId);
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (app) return app;
  app = getApps().length > 0 ? getApps()[0]! : initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (auth) return auth;
  const a = getFirebaseApp();
  if (!a) return null;
  auth = getAuth(a);
  return auth;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const a = getFirebaseAuth();
  if (!a) throw new Error("Firebase belum terkonfigurasi");
  const result = await signInWithEmailAndPassword(a, email, password);
  return result.user;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<User> {
  const a = getFirebaseAuth();
  if (!a) throw new Error("Firebase belum terkonfigurasi");
  const result = await createUserWithEmailAndPassword(a, email, password);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
}

export async function resetPassword(email: string): Promise<void> {
  const a = getFirebaseAuth();
  if (!a) throw new Error("Firebase belum terkonfigurasi");
  await sendPasswordResetEmail(a, email);
}

export async function signOut(): Promise<void> {
  const a = getFirebaseAuth();
  if (!a) return;
  await fbSignOut(a);
}

export function onAuthChange(cb: (user: User | null) => void): () => void {
  const a = getFirebaseAuth();
  if (!a) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(a, cb);
}

export async function getIdToken(): Promise<string | null> {
  const a = getFirebaseAuth();
  if (!a?.currentUser) return null;
  try {
    return await a.currentUser.getIdToken();
  } catch {
    return null;
  }
}

export const ADMIN_UID = (import.meta.env.VITE_ADMIN_UID as string | undefined) || "";
export const WA_SUPPORT = (import.meta.env.VITE_WA_SUPPORT as string | undefined) || "";
