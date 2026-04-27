import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import { getDb, FieldValue } from "../lib/firebase";
import { optionalAuth } from "../middlewares/auth";

const router: IRouter = Router();

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  uid?: string;
}

// In-memory fallback used only when Firestore isn't configured.
const seedFallback: Testimonial[] = [
  {
    id: randomUUID(),
    name: "Rizky A.",
    rating: 5,
    comment: "Cepat banget, OTP langsung masuk. Recommended!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: randomUUID(),
    name: "Maya P.",
    rating: 5,
    comment: "Top up QRIS responsif, harga juga bersaing. Mantap.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: randomUUID(),
    name: "Bagas S.",
    rating: 4,
    comment: "Pilihan layanan lengkap, UI mobile-nya enak dipakai.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
  },
];

router.get("/testimonials", async (_req, res) => {
  const db = getDb();
  if (!db) {
    res.json({ items: [...seedFallback].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
    return;
  }
  try {
    const snap = await db.collection("testimonials").orderBy("createdAt", "desc").limit(50).get();
    const items: Testimonial[] = snap.docs.map((d) => {
      const data = d.data() as Partial<Testimonial>;
      return {
        id: d.id,
        name: String(data.name ?? ""),
        rating: Number(data.rating ?? 5),
        comment: String(data.comment ?? ""),
        createdAt: String(data.createdAt ?? new Date().toISOString()),
        uid: data.uid,
      };
    });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Firestore read failed" });
  }
});

router.post("/testimonials", optionalAuth, async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const name =
    typeof body["name"] === "string" ? body["name"].trim() : req.user?.name?.trim() || "";
  const ratingRaw = body["rating"];
  const rating = typeof ratingRaw === "number" ? ratingRaw : Number(ratingRaw);
  const comment = typeof body["comment"] === "string" ? body["comment"].trim() : "";

  if (!name || !comment) {
    res.status(400).json({ error: "name and comment are required" });
    return;
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    res.status(400).json({ error: "rating must be 1-5" });
    return;
  }

  const item: Testimonial = {
    id: randomUUID(),
    name: name.slice(0, 60),
    rating: Math.round(rating),
    comment: comment.slice(0, 500),
    createdAt: new Date().toISOString(),
    uid: req.user?.uid,
  };

  const db = getDb();
  if (!db) {
    seedFallback.unshift(item);
    res.status(201).json({ item });
    return;
  }

  try {
    await db.collection("testimonials").doc(item.id).set(item);
    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Firestore write failed" });
  }
});

router.get("/stats", async (_req, res) => {
  const db = getDb();
  if (!db) {
    res.json({
      totalUsers: 0,
      totalOrders: 0,
      totalTransactions: 0,
      testimonialCount: seedFallback.length,
    });
    return;
  }
  try {
    const [usersSnap, ordersSnap, depositsSnap, testimonialsSnap] = await Promise.all([
      db.collection("users").count().get(),
      db.collectionGroup("orders").count().get(),
      db.collectionGroup("deposits").count().get(),
      db.collection("testimonials").count().get(),
    ]);
    res.json({
      totalUsers: usersSnap.data().count,
      totalOrders: ordersSnap.data().count,
      totalTransactions: ordersSnap.data().count + depositsSnap.data().count,
      testimonialCount: testimonialsSnap.data().count,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Firestore stats failed" });
  }
});

// Touch (upsert) the current user — called on sign-in.
router.post("/me/touch", optionalAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const db = getDb();
  if (!db) {
    res.json({ uid: req.user.uid, isAdmin: req.user.isAdmin });
    return;
  }
  try {
    await db.collection("users").doc(req.user.uid).set(
      {
        uid: req.user.uid,
        email: req.user.email ?? null,
        name: req.user.name ?? null,
        lastSeenAt: new Date().toISOString(),
        firstSeenAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    res.json({ uid: req.user.uid, isAdmin: req.user.isAdmin });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Firestore touch failed" });
  }
});

export default router;
