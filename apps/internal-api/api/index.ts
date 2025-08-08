import { Hono } from "hono";
import { handle } from "hono/vercel";

import type { AuthType } from "../lib/auth.ts";
import { withAuth } from "../middleware/session.ts";

// Route handlers
import auth from "../handlers/auth.ts";
import projects from "../handlers/projects.ts";
import teams from "../handlers/teams.ts"; 

// Base app
const app = new Hono<{ Variables: AuthType }>().basePath("/api");

app.get("/", (c) => {
  return c.json({ message: "Hello from Hono!" });
});

// v1 namespace
const v1 = new Hono<{ Variables: AuthType }>();

// Global middleware
v1.use("*", withAuth);

// Health check
v1.get("/health", (c) => {
  return c.json({
    success: true,
    message: "API is healthy",
  });
});

v1.route("/auth", auth);
v1.route("/projects", projects);
v1.route("/teams", teams);

app.route("/v1", v1);

export default app;
