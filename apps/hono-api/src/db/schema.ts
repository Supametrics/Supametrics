import {
  pgTable,
  serial,
  uuid,
  text,
  timestamp,
  boolean,
  varchar,
  integer,
  jsonb,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// Enums
export const teamRoleEnum = pgEnum("team_role", ["owner", "member", "viewer"]);
export const projectRoleEnum = pgEnum("project_role", ["admin", "editor", "viewer"]);
export const inviteStatusEnum = pgEnum("invite_status", ["pending", "accepted", "revoked"]);

// Teams
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  ownerId: uuid("owner_id").notNull().references(() => user.uuid, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team Members
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: uuid("team_id").notNull().references(() => teams.uuid, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => user.uuid, { onDelete: "cascade" }),
  role: teamRoleEnum("role").default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Team Invites
export const teamInvites = pgTable("team_invites", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  teamId: uuid("team_id").notNull().references(() => teams.uuid, { onDelete: "cascade" }),
  email: varchar("email", { length: 256 }).notNull(),
  role: teamRoleEnum("role").default("member"),
  status: inviteStatusEnum("status").default("pending"),
  invitedAt: timestamp("invited_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

// Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 64 }).notNull(),
  description: text("description"),
  userId: uuid("user_id").references(() => user.uuid, { onDelete: "cascade" }),
  teamId: uuid("team_id").references(() => teams.uuid, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  uniqueSlugPerTeam: unique().on(t.slug, t.teamId),
  uniqueSlugPerUser: unique().on(t.slug, t.userId),
}));

// project Members
export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.uuid, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => user.uuid, { onDelete: "cascade" }),
  role: projectRoleEnum("role").default("viewer"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// project API Keys
export const projectApiKeys = pgTable("project_api_keys", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  projectId: uuid("project_id").notNull().references(() => projects.uuid, { onDelete: "cascade" }),
  publicKey: varchar("public_key", { length: 128 }).notNull().unique(),
  secretKey: varchar("secret_key", { length: 256 }).notNull().unique(),
  revoked: boolean("revoked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

// analytics Events
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),

  projectId: uuid("project_id").notNull().references(() => projects.uuid, { onDelete: "cascade" }),

  sessionId: varchar("session_id", { length: 64 }).notNull(), // unique per session
  visitorId: varchar("visitor_id", { length: 64 }), // anonymous visitor ID (daily)

  timestamp: timestamp("timestamp").defaultNow(),

  pathname: text("pathname").notNull(),
  referrer: text("referrer"),
  origin: text("origin"),

  utmSource: varchar("utm_source", { length: 64 }),
  utmMedium: varchar("utm_medium", { length: 64 }),
  utmCampaign: varchar("utm_campaign", { length: 64 }),
  utmTerm: varchar("utm_term", { length: 64 }),
  utmContent: varchar("utm_content", { length: 64 }),

  eventType: varchar("event_type", { length: 64 }).notNull(), // e.g. "pageview"
  eventName: varchar("event_name", { length: 128 }), // e.g. "cta_clicked"
  eventData: jsonb("event_data"),

  browserName: varchar("browser_name", { length: 64 }),
  browserVersion: varchar("browser_version", { length: 64 }),
  osName: varchar("os_name", { length: 64 }),
  osVersion: varchar("os_version", { length: 64 }),
  deviceType: varchar("device_type", { length: 64 }), // e.g. "mobile", "desktop", "tablet"
  userAgent: text("user_agent"), 

  duration: integer("duration"), // in seconds
});
