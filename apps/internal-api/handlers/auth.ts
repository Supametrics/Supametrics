import { Hono } from "hono";
import { auth } from "../lib/auth.ts";
import type { AuthType } from "../lib/auth.ts";

const authHandler = new Hono<{ Bindings: AuthType }>({
  strict: false,
});

authHandler.on(["POST", "GET"], "/*", (c) => {
  return auth.handler(c.req.raw);
});

export default authHandler;
