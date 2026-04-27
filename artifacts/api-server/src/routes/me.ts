import { Router, type IRouter, type Request, type Response } from "express";
import { getDb, FieldValue } from "../lib/firebase";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

const ALLOWED_KINDS = ["orders", "deposits", "withdraws"] as const;
type Kind = (typeof ALLOWED_KINDS)[number];

function kindFromReq(req: Request): Kind | null {
  const k = req.params["kind"];
  return ALLOWED_KINDS.includes(k as Kind) ? (k as Kind) : null;
}

function noFirestore(res: Response): void {
  res.status(503).json({ error: "Firestore tidak terkonfigurasi" });
}

// List my history items
router.get("/me/:kind", requireAuth, async (req, res) => {
  const kind = kindFromReq(req);
  if (!kind) {
    res.status(400).json({ error: "invalid kind" });
    return;
  }
  const db = getDb();
  if (!db) {
    noFirestore(res);
    return;
  }
  try {
    const snap = await db
      .collection("users")
      .doc(req.user!.uid)
      .collection(kind)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    const items = snap.docs.map((d) => ({ ...(d.data() as object), id: d.id }));
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "read failed" });
  }
});

// Upsert a history item by id
router.post("/me/:kind", requireAuth, async (req, res) => {
  const kind = kindFromReq(req);
  if (!kind) {
    res.status(400).json({ error: "invalid kind" });
    return;
  }
  const body = (req.body ?? {}) as Record<string, unknown>;
  const id = typeof body["id"] === "string" ? body["id"] : "";
  if (!id) {
    res.status(400).json({ error: "id is required" });
    return;
  }
  const db = getDb();
  if (!db) {
    noFirestore(res);
    return;
  }
  try {
    const ref = db.collection("users").doc(req.user!.uid).collection(kind).doc(id);
    await ref.set(
      {
        ...body,
        id,
        uid: req.user!.uid,
        updatedAt: new Date().toISOString(),
        createdAt: body["createdAt"] ?? new Date().toISOString(),
        _serverWrittenAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "write failed" });
  }
});

// Delete a history item by id
router.delete("/me/:kind/:id", requireAuth, async (req, res) => {
  const kind = kindFromReq(req);
  if (!kind) {
    res.status(400).json({ error: "invalid kind" });
    return;
  }
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id is required" });
    return;
  }
  const db = getDb();
  if (!db) {
    noFirestore(res);
    return;
  }
  try {
    await db.collection("users").doc(req.user!.uid).collection(kind).doc(id).delete();
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "delete failed" });
  }
});

export default router;
