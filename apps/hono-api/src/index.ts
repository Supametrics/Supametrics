import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { withAuth } from "./middleware/session.js";
import { rateLimiter } from "./middleware/rate-limiter.js";

import overviewRoute from "./handlers/overview.js";
import projectRoutes from "./handlers/projects.js";
import analyticsRoutes from "./handlers/analytics.js";
import reportRoutes from "./handlers/reports.js";
import teamRoutes from "./handlers/teams.js";

import type { AuthType } from "./lib/auth.js";
import authHandler from "@/handlers/auth.js";
import sessionHandler from "./handlers/session.js";
import profileRoute from "./handlers/profile.js";

const app = new Hono<{ Variables: AuthType }>({});

app.use("*", logger());

app.notFound((c) => {
  return c.json({ error: "Not Found - Visit supametrics.com" }, 404);
});

app.get("/", (c) => {
  return c.text("Hello Nerd! Visit supametrics.com, powered by Hono!");
});

const v1 = new Hono().basePath("/api/v1");

// CORS for all v1 routes
v1.use(
  "*",
  cors({
    origin: process.env.TRUSTED_ORIGIN || "http://localhost:3002",
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Custom-Header",
      "Upgrade-Insecure-Requests",
    ],
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// Health check
v1.get("/health", rateLimiter(60 * 1000, 5), (c) => {
  return c.json({ message: "Server is healthy!" });
});

// Auth routes (15 req per hour for login/signup etc., no auth required)
v1.route("/auth", authHandler.use(rateLimiter(60 * 60 * 1000, 15)));

// Everything else requires authentication
v1.use("*", withAuth);

// Session — 90 requests/hour
v1.route("/session", sessionHandler.use(rateLimiter(60 * 60 * 1000, 90)));
v1.route("/profile", profileRoute.use(rateLimiter(60 * 60 * 1000, 90)));

// Projects — 100 requests/hour
v1.route("/projects", projectRoutes.use(rateLimiter(60 * 60 * 1000, 100)));

// Overview
v1.route("/overview", overviewRoute.use(rateLimiter(60 * 60 * 1000, 100)));

// Analytics — 50 requests/hour
v1.route("/analytics", analyticsRoutes.use(rateLimiter(60 * 60 * 1000, 50)));

// Reports — 50 requests/hour
v1.route("/reports", reportRoutes.use(rateLimiter(60 * 60 * 1000, 50)));

// Teams — 50 requests/hour
v1.route("/teams", teamRoutes.use(rateLimiter(60 * 60 * 1000, 50)));

// Attach v1 to app
app.route("/", v1);

serve(
  {
    fetch: app.fetch,
    port: 3004,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
