import {
  pgTable,
  serial,
  uuid,
  text,
  timestamp,
  boolean,
  varchar,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// Enums
export const teamRoleEnum = pgEnum("team_role", ["owner", "member", "viewer"]);
export const projectRoleEnum = pgEnum("project_role", [
  "admin",
  "editor",
  "viewer",
]);
export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "accepted",
  "revoked",
]);

// Teams
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(), // short + unique
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => user.uuid, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team Members
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.uuid, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.uuid, { onDelete: "cascade" }),
  role: teamRoleEnum("role").default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Team Invites
export const teamInvites = pgTable("team_invites", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.uuid, { onDelete: "cascade" }),
  email: varchar("email", { length: 256 }).notNull(),
  role: teamRoleEnum("role").default("member"),
  status: inviteStatusEnum("status").default("pending"),
  invitedAt: timestamp("invited_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

// Projects
export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    uuid: uuid("uuid").defaultRandom().notNull().unique(),
    name: text("name").notNull(),
    slug: varchar("slug", { length: 64 }).notNull(),
    description: text("description"),
    userId: uuid("user_id").references(() => user.uuid, {
      onDelete: "cascade",
    }),
    teamId: uuid("team_id").references(() => teams.uuid, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    uniqueSlugPerTeam: unique().on(t.slug, t.teamId),
    uniqueSlugPerUser: unique().on(t.slug, t.userId),
  })
);

// Project Members
export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.uuid, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.uuid, { onDelete: "cascade" }),
  role: projectRoleEnum("role").default("viewer"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Project API Keys
export const projectApiKeys = pgTable("project_api_keys", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.uuid, { onDelete: "cascade" }),
  publicKey: varchar("public_key", { length: 128 }).notNull().unique(),
  secretKey: varchar("secret_key", { length: 256 }).notNull().unique(),
  revoked: boolean("revoked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
});
