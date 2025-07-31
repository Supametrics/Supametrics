import { Hono } from "hono";
import { handle } from "hono/vercel";

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath("/api");

app.get("/", (c) => {
  return c.json({ message: "Hello from Hono!" });
});

const v1 = new Hono();

v1.get("/health", (c) => {
  return c.json({
    success: true,
    message: "API is healthy",
  });
});

app.route("/v1", v1);

export default handle(app);
