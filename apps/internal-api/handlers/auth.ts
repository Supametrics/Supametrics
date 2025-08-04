import { Hono } from "hono";
import { auth } from "../lib/auth";
import type { AuthType } from "../lib/auth";

const authHandler = new Hono<{ Bindings: AuthType }>({
  strict: false,
});

authHandler.on(["POST", "GET"], "/*", (c) => {
  return auth.handler(c.req.raw);
});

export default authHandler;

/*


import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  uuid: uuid("uuid").defaultRandom().notNull().unique(),

  email: text("email").notNull().unique(),
  password: text("password").notNull(),

  emailVerified: boolean("email_verified").default(false),
  isMobileVerified: boolean("mobile_verified").default(false),

  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  image: text("image"),

  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: text("user_agent"),

  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),

  role: text("role").default("user"), // user | admin | superadmin
  subscriptionType: text("subscription_type").default("free"), // free | paid | enterprise

  provider: text("provider").default("credentials"), // credentials | google | github | etc.
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),

  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),

  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.uuid),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.uuid),

  role: text("role").default("member"), // owner | member | viewer | etc.
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),

  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.uuid),

  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

*/
