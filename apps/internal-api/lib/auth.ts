import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { users } from "../db/schema";

type OnSignupContext = {
  user: { id: string };
  db: any;
  request: Request;
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...users,
    },
  }),
  trustedOrigins: ["http://localhost:3000"],
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
  events: {
    async onSignup({ user, db, request }: OnSignupContext) {
      const ip = request.headers.get("x-forwarded-for") || "";
      const agent = request.headers.get("user-agent") || "";

      const body = await request.json().catch(() => ({}));
      const fullName = body.fullName || null;

      await db.user.update({
        where: { id: user.id },
        data: {
          role: "user",
          ipAddress: ip,
          userAgent: agent,
          fullName,
        },
      });

      // TODO: send welcome email, etc
    },
  },
});

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
