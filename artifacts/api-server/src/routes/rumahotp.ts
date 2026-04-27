import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const RUMAHOTP_BASE = "https://www.rumahotp.io";

function getApiKey(): string {
  const key = process.env["RUMAHOTP_API_KEY"];
  if (!key) {
    throw new Error("RUMAHOTP_API_KEY is not configured");
  }
  return key;
}

async function callRumahOtp(
  path: string,
  params: Record<string, string | undefined>,
  _req: Request,
): Promise<{ status: number; body: unknown }> {
  const url = new URL(RUMAHOTP_BASE + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  logger.info({ url: url.pathname + url.search }, "RumahOTP request");

  const upstream = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "x-apikey": getApiKey(),
      Accept: "application/json",
    },
  });

  const text = await upstream.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  logger.info({ status: upstream.status, path }, "RumahOTP response");

  return { status: upstream.status, body };
}

function strParam(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function handleError(res: Response, err: unknown): void {
  const message = err instanceof Error ? err.message : "Unknown error";
  res.status(500).json({ error: message });
}

// ====== SERVICES ======
router.get("/rumahotp/services", async (req, res) => {
  try {
    const { status, body } = await callRumahOtp("/api/v2/services", {}, req);
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

// ====== COUNTRIES ======
router.get("/rumahotp/countries", async (req, res) => {
  try {
    const service_id = strParam(req.query["service_id"]);
    const { status, body } = await callRumahOtp("/api/v2/countries", { service_id }, req);
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

// ====== OPERATORS ======
router.get("/rumahotp/operators", async (req, res) => {
  try {
    const country = strParam(req.query["country"]);
    const provider_id = strParam(req.query["provider_id"]);
    const { status, body } = await callRumahOtp("/api/v2/operators", { country, provider_id }, req);
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

// ====== ORDER ======
router.get("/rumahotp/order", async (req, res) => {
  try {
    const number_id = strParam(req.query["number_id"]);
    const provider_id = strParam(req.query["provider_id"]);
    const operator_id = strParam(req.query["operator_id"]);
    const { status, body } = await callRumahOtp(
      "/api/v2/orders",
      { number_id, provider_id, operator_id },
      req,
    );
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

// ====== ORDER STATUS ======
router.get("/rumahotp/order-status", async (req, res) => {
  try {
    const order_id = strParam(req.query["order_id"]);
    const { status, body } = await callRumahOtp("/api/v1/orders/get_status", { order_id }, req);
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

// ====== ORDER CANCEL ======
router.get("/rumahotp/order-cancel", async (req, res) => {
  try {
    const order_id = strParam(req.query["order_id"]);
    const { status, body } = await callRumahOtp(
      "/api/v1/orders/set_status",
      { order_id, status: "cancel" },
      req,
    );
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

// ====== DEPOSIT CREATE ======
router.get("/rumahotp/deposit-create", async (req, res) => {
  try {
    const amount = strParam(req.query["amount"]);
    const { status, body } = await callRumahOtp(
      "/api/v2/deposit/create",
      { amount, payment_id: "qris" },
      req,
    );
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

// ====== DEPOSIT STATUS ======
router.get("/rumahotp/deposit-status", async (req, res) => {
  try {
    const deposit_id = strParam(req.query["deposit_id"]);
    const { status, body } = await callRumahOtp(
      "/api/v2/deposit/get_status",
      { deposit_id },
      req,
    );
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

// ====== DEPOSIT CANCEL ======
router.get("/rumahotp/deposit-cancel", async (req, res) => {
  try {
    const deposit_id = strParam(req.query["deposit_id"]);
    const { status, body } = await callRumahOtp(
      "/api/v1/deposit/cancel",
      { deposit_id },
      req,
    );
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

// ====== H2H PRODUCT ======
router.get("/rumahotp/h2h-product", async (req, res) => {
  try {
    const { status, body } = await callRumahOtp("/api/v1/h2h/product", {}, req);
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

// ====== H2H LIST REKENING ======
router.get("/rumahotp/h2h-list-rekening", async (req, res) => {
  try {
    const { status, body } = await callRumahOtp("/api/v1/h2h/list/rekening", {}, req);
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

// ====== H2H CHECK REKENING ======
router.get("/rumahotp/h2h-check-rekening", async (req, res) => {
  try {
    const bank_code = strParam(req.query["bank_code"]);
    const account_number = strParam(req.query["account_number"]);
    const { status, body } = await callRumahOtp(
      "/api/v1/h2h/check/rekening",
      { bank_code, account_number },
      req,
    );
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

// ====== H2H CREATE WD ======
router.get("/rumahotp/h2h-create", async (req, res) => {
  try {
    const target = strParam(req.query["target"]);
    const id = strParam(req.query["id"]);
    const { status, body } = await callRumahOtp(
      "/api/v1/h2h/transaksi/create",
      { target, id },
      req,
    );
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

// ====== H2H STATUS ======
router.get("/rumahotp/h2h-status", async (req, res) => {
  try {
    const transaksi_id = strParam(req.query["transaksi_id"]);
    const { status, body } = await callRumahOtp(
      "/api/v1/h2h/transaksi/status",
      { transaksi_id },
      req,
    );
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

// ====== ADMIN BALANCE ======
router.get("/rumahotp/admin-balance", async (req, res) => {
  try {
    const { status, body } = await callRumahOtp("/api/v1/user/balance", {}, req);
    res.status(status).json(body);
  } catch (err) {
    handleError(res, err);
  }
});

export default router;
