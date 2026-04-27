import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import { logger } from "./lib/logger";

// pino-http v10: handle ESM/CJS interop — may be callable or have .default
// We use dynamic require pattern via type assertion to avoid TS2349
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pinoHttpMod = require("pino-http");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const pinoHttpFn: (...args: unknown[]) => unknown =
  typeof pinoHttpMod === "function"
    ? (pinoHttpMod as (...args: unknown[]) => unknown)
    : typeof pinoHttpMod?.default === "function"
      ? (pinoHttpMod.default as (...args: unknown[]) => unknown)
      : (() => (_req: unknown, _res: unknown, next: () => void) => next()) as (...args: unknown[]) => unknown;

const app: Express = express();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(pinoHttpFn({
  logger,
  serializers: {
    req(req: { id: unknown; method: string; url?: string }) {
      return {
        id: req.id,
        method: req.method,
        url: req.url?.split("?")[0],
      };
    },
    res(res: { statusCode: number }) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
}) as Parameters<Express["use"]>[0]);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
