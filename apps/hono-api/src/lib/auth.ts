import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import * as authSchema from "../db/auth-schema.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...authSchema,
      user: authSchema.user,
    },
  }),
  trustedOrigins: [process.env.TRUSTED_ORIGIN!],
  basePath: "/",
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});

export type AuthType = {
  user: (typeof auth.$Infer.Session.user & { uuid?: string }) | null;
  session: typeof auth.$Infer.Session.session | null;
};
