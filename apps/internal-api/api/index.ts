import { Hono } from "hono";
import { handle } from "hono/vercel";
import auth from "../handlers/auth";
import type { AuthType } from "../lib/auth";

export const config = {
  runtime: "edge",
};

const app = new Hono<{ Variables: AuthType }>().basePath("/api");

app.get("/", (c) => {
  return c.json({ message: "Hello from Hono!" });
});

// /api/v1 routes
const v1 = new Hono<{ Variables: AuthType }>();

v1.get("/health", (c) => {
  return c.json({
    success: true,
    message: "API is healthy",
  });
});

v1.route("/auth", auth);

app.route("/v1", v1);

export default handle(app);
