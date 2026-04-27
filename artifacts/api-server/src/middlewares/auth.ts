import type { Request, Response, NextFunction, RequestHandler } from "express";
import { getAdminAuth, ADMIN_UID } from "../lib/firebase";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        name?: string;
        isAdmin: boolean;
      };
    }
  }
}

async function extractUser(req: Request): Promise<Request["user"] | null> {
  const header = req.headers.authorization || req.headers.Authorization;
  const headerStr = Array.isArray(header) ? header[0] : header;
  if (!headerStr || typeof headerStr !== "string") return null;
  const m = headerStr.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const token = m[1];
  if (!token) return null;
  const auth = getAdminAuth();
  if (!auth) return null;
  try {
    const decoded = await auth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name as string | undefined,
      isAdmin: ADMIN_UID !== "" && decoded.uid === ADMIN_UID,
    };
  } catch {
    return null;
  }
}

// Soft auth: attach req.user if a valid token is provided, but never block.
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const user = await extractUser(req);
  if (user) req.user = user;
  next();
};

// Strict auth: 401 if no valid token.
export const requireAuth: RequestHandler = async (req, res, next) => {
  const user = await extractUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.user = user;
  next();
};

// Admin-only.
export const requireAdmin: RequestHandler = async (req, res, next) => {
  const user = await extractUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!user.isAdmin) {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  req.user = user;
  next();
};

export { ADMIN_UID };
