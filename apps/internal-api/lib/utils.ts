import crypto from "crypto";

export function generateApiKeys() {
  const publicKey = `supm_${crypto.randomBytes(16).toString("hex")}`;
  const secretKey = `sk_${crypto.randomBytes(32).toString("hex")}`;
  return { publicKey, secretKey };
}
