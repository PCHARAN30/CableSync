const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const connectDB = require("./config/db");

const customerRoutes = require("./routes/customerRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const importRoutes = require("./routes/importRoutes");
const exportRoutes = require("./routes/exportRoutes");
const searchRoutes = require("./routes/searchRoutes");
const customerPortalRoutes = require("./routes/customerPortalRoutes");
const supportRoutes = require("./routes/supportRoutes");
const operatorRoutes = require("./routes/operatorRoutes");
const paymentProofRoutes = require("./routes/paymentProofRoutes");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// --- Middleware ---
// CORS: restrict to the configured frontend origin(s) in production.
// FRONTEND_ORIGIN was already documented in the deploy instructions and
// render.yaml, but nothing in the app actually read it — cors() with no
// options allows every origin regardless of what's set. Fixed below.
// Supports a comma-separated list, e.g. "https://app.example.com,https://admin.example.com".
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests, curl, health checks, etc. have no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (!isProduction && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      if (isProduction && allowedOrigins.length === 0) {
        // Misconfiguration: fail closed rather than silently allowing everyone.
        console.error(
          "[CORS] FRONTEND_ORIGIN is not set in production — rejecting cross-origin request from",
          origin,
        );
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
// Payment proof screenshots are sent as data URLs and are limited by the
// application-level validation in paymentProofController.
app.use(express.json({ limit: "7mb" }));

// Health check - no auth required, useful for uptime pings
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Static frontend build and public assets
const distPath = path.join(__dirname, "../frontend/dist");
const publicPath = path.join(__dirname, "../frontend/public");
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}
app.use(express.static(distPath));

// Public Authentication routes
// Customer Portal API routes (mobile subscriber app)
app.use("/customer-api", customerPortalRoutes);
app.use("/api/customer", customerPortalRoutes);
app.use("/api/v1/customer", customerPortalRoutes);

// Operator API routes (requires valid Operator JWT or dev PIN)
const apiRoutes = [
  ["/customers", customerRoutes],
  ["/payments", paymentRoutes],
  ["/dashboard", dashboardRoutes],
  ["/reports", reportRoutes],
  ["/import", importRoutes],
  ["/export", exportRoutes],
  ["/search", searchRoutes],
  ["/support", supportRoutes],
  ["/tickets", supportRoutes],
  ["/operator", operatorRoutes],
  ["/payment-proofs", paymentProofRoutes],
];

apiRoutes.forEach(([routePath, router]) => {
  app.use(routePath, router);
  app.use(`/api${routePath}`, router);
  app.use(`/api/v1${routePath}`, router);
});

// Database offline fallback error handler
app.use((err, req, res, next) => {
  if (
    err.name === "MongooseError" ||
    err.name === "MongoNetworkError" ||
    err.name === "MongooseServerSelectionError" ||
    (err.message && err.message.includes("buffering timed out"))
  ) {
    console.warn("[AI Studio] Database offline — returning mock empty response");
    if (req.method === "GET") {
      return res.json(req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {});
    }
    return res
      .status(503)
      .json({ error: "Service temporarily unavailable (database offline)" });
  }
  next(err);
});

// SPA fallback for frontend client-side routes (HTML5 history)
app.get("*", (req, res, next) => {
  const apiPrefixes = [
    "/customers",
    "/payments",
    "/dashboard",
    "/reports",
    "/import",
    "/export",
    "/search",
    "/health",
    "/api",
    "/customer-api",
    "/support",
    "/tickets",
    "/operator",
    "/payment-proofs",
  ];
  if (apiPrefixes.some((p) => req.path.startsWith(p))) {
    return res.status(404).json({ error: "Route not found" });
  }
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).send("Application build not found. Please build frontend.");
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error("Unhandled API error:", err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`CableSync running on http://0.0.0.0:${PORT}`),
    );
  })
  .catch((err) => {
    // A production deploy with no working database should crash loudly
    // (Render marks the service unhealthy) rather than start and silently
    // serve requests against an in-memory store.
    console.error("Fatal startup error:", err.message);
    process.exit(1);
  });
