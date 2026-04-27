import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "./logger";

let cachedApp: App | null = null;

function normalizePrivateKey(raw: string): string {
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  if (key.includes("\\n")) {
    key = key.replace(/\\n/g, "\n");
  }
  return key;
}

export function getFirebaseApp(): App | null {
  if (cachedApp) return cachedApp;
  if (getApps().length > 0) {
    cachedApp = getApp();
    return cachedApp;
  }

  const projectId = process.env["FIREBASE_PROJECT_ID"];
  const clientEmail = process.env["FIREBASE_CLIENT_EMAIL"];
  const privateKeyRaw = process.env["FIREBASE_PRIVATE_KEY"];

  if (!projectId || !clientEmail || !privateKeyRaw) {
    logger.warn(
      { hasProjectId: !!projectId, hasClientEmail: !!clientEmail, hasPrivateKey: !!privateKeyRaw },
      "Firebase Admin not configured — Firestore-backed routes will return 503",
    );
    return null;
  }

  try {
    cachedApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: normalizePrivateKey(privateKeyRaw),
      }),
    });
    logger.info({ projectId }, "Firebase Admin initialized");
    return cachedApp;
  } catch (err) {
    logger.error({ err }, "Failed to initialize Firebase Admin");
    return null;
  }
}

export function getDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  return getFirestore(app);
}

export function getAdminAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  return getAuth(app);
}

export { FieldValue };

export const ADMIN_UID = process.env["ADMIN_UID"] || "";
