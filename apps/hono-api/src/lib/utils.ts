import crypto from "crypto";
import type { Context } from "hono";

export function generateApiKeys() {
  const publicKey = `supm_${crypto.randomBytes(16).toString("hex")}`;
  const secretKey = `sk_${crypto.randomBytes(32).toString("hex")}`;
  return { publicKey, secretKey };
}

export function getPaginationParams(c: Context) {
  const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "20", 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}