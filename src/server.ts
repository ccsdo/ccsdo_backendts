// src/server.ts
import "dotenv/config"; // loads .env into process.env
import express, { Request, Response, NextFunction } from "express";
import { connect } from "mongoose";
import { appendFile } from "fs/promises";
import cors from "cors";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit"; // example fallback if your globalLimiter isn't ready
import { AddressInfo } from "net";

import globalLimiter from "./utils/globalLimeter";
import formRoutes from "./routes/formRoutes";
import authRoutes from "./routes/auth";
import donationRoutes from "./routes/donationRoutes";
import exportRoutes from "./routes/deleteRoutes";
import track from "./routes/track";

type Maybe<T> = T | undefined | null;

const TIMEZONE = "Asia/Kolkata";

const LOG = {
  async access(line: string) {
    try {
      await appendFile("access.log", line + "\n");
    } catch (e) {
      // best-effort logging — swallow so logging failure doesn't crash the server
      // eslint-disable-next-line no-console
      console.error("Failed to write access log", e);
    }
  },
  async error(line: string) {
    try {
      await appendFile("errorfile.log", line + "\n");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to write error log", e);
    }
  },
  async cors(line: string) {
    try {
      await appendFile("corsaccess.log", line + "\n");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to write cors log", e);
    }
  },
};

function now(): string {
  return new Date().toLocaleString("en-IN", { timeZone: TIMEZONE });
}

/* -----------------------------
   Global process handlers
   ----------------------------- */
process.on("uncaughtException", async (err: Error) => {
  const log = `[${now()}] Uncaught Exception: ${err?.stack ?? err?.message ?? err}`;
  await LOG.error(log);
  // give a moment to flush logs then exit
  setTimeout(() => process.exit(1), 300);
});

process.on("unhandledRejection", async (reason: any) => {
  const what = reason instanceof Error ? reason.stack ?? reason.message : String(reason);
  const log = `[${now()}] Unhandled Promise Rejection: ${what}`;
  await LOG.error(log);
  setTimeout(() => process.exit(1), 300);
});

/* -----------------------------
   Express app setup
   ----------------------------- */
const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Trust proxy (if behind load balancer / reverse proxy)
app.set("trust proxy", 1);

// Build allowed origins list from env (could be undefined)
const allowedOrigins = [
  process.env.FRONTEND_URL1 as Maybe<string>,
  process.env.FRONTEND_URL2 as Maybe<string>,
].filter(Boolean) as string[];

/* CORS middleware customized per your original logic */
app.use(
  cors({
    origin: (origin: Maybe<string>, callback) => {
        const formatted = now();
        LOG.cors(`[${formatted}] CORS blocked: ${origin}`).catch(() => undefined);
      // Allow requests with no origin (Postman, server-to-server)
      if (!origin) return callback(null, false);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {

        return callback(null, false);
      }

    },
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);

/* Request logger (writes to access.log) */
app.use((req: Request, _res: Response, next: NextFunction) => {
  const ip =
    (req.headers["x-forwarded-for"] as Maybe<string>)?.split?.(",")?.[0] ??
    req.socket.remoteAddress ??
    "unknown";
  const origin = (req.headers.origin as Maybe<string>) ?? "undefined";
  LOG.access(`[${now()}] Request from IP: ${ip}, Origin: ${origin}`).catch(() => undefined);
  next();
});

/* Global rate limiter — prefer your custom one, fallback to a simple limiter */
if (globalLimiter && typeof globalLimiter === "function") {
  app.use(globalLimiter as any);
} else {
  // fallback to express-rate-limit if globalLimiter not available
  const fallbackLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
  });
  app.use(fallbackLimiter);
}

/* Basic UA check */
app.use((req: Request, res: Response, next: NextFunction) => {
  const ua = (req.headers["user-agent"] as Maybe<string>) ?? "";
  if (ua.includes("autocannon")) {
    return res.status(403).send("Forbidden");
  }
  next();
});

/* -----------------------------
   Routes
   ----------------------------- */
app.use("/api/forms", formRoutes as any);
app.use("/api/auth", authRoutes as any);
app.use("/api/donation", donationRoutes as any);
app.use("/api/export", exportRoutes as any);
app.use("/api/track", track as any);

/* Error handling middleware (Express) */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const errText = err?.stack ?? err?.message ?? String(err);
  LOG.error(`[${now()}] API Error: ${errText}`).catch(() => undefined);
  // Don't leak internal details to clients
  res.status(500).json({ success: false, message: "Server Error" });
});

/* -----------------------------
   Start server after DB connection
   ----------------------------- */
const MONGO_URI = process.env.MONGO_URI ?? "";
const PORT = Number(process.env.PORT ?? 4000);

if (!MONGO_URI) {
  // unacceptable to start without DB connection string
  (async () => {
    await LOG.error(`[${now()}] Missing MONGO_URI in environment. Exiting.`);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })();
} else {
  connect(MONGO_URI)
    .then(() => {
      // start server only after DB is connected
      const server = app.listen(PORT, () => {
        const addr = server.address() as AddressInfo | null;
        const port = addr?.port ?? PORT;
        console.log(`MongoDB connected`);
        console.log(`Server running on port ${port}`);
      });

      // Handle graceful shutdown signals
      const graceful = async (signal: string) => {
        console.log(`Received ${signal}, closing server...`);
        server.close(() => {
          console.log("HTTP server closed");
          process.exit(0);
        });
        // force exit after timeout
        setTimeout(() => process.exit(1), 10_000);
      };

      process.on("SIGINT", () => graceful("SIGINT"));
      process.on("SIGTERM", () => graceful("SIGTERM"));
    })
    .catch(async (err) => {
      await LOG.error(`[${now()}] MongoDB connection error: ${err?.stack ?? err}`);
      console.error("Mongo connection failed:", err);
      process.exit(1);
    });
}
