// fix DNS issue
import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { errorHandler } from "./middlewares/error.js";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express();

// 1. Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-production-domain.com"]
        : "http://localhost:5173",
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth)); //For ExpressJS v5

// 2. Request Parsing Middlewares
app.use(morgan("dev"));

app.use(express.json()); // Strict body size limit per security rules
app.use(express.urlencoded({ extended: true }));

// 3. Health Check
app.get("/health", async (req, res) => {
  try {
    const db = await connectDB();
    const state = db.readyState;
    // 1 = connected
    if (state !== 1) {
      return res.status(503).json({ status: "unhealthy", dbState: state });
    }
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Health check failed" });
  }
});

// 4. Global Error Handler (must be last)
app.use(errorHandler);

const PORT = env.PORT;

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export { app };
