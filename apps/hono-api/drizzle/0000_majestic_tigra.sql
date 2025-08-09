CREATE TYPE "public"."invite_status" AS ENUM('pending', 'accepted', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."project_role" AS ENUM('admin', 'editor', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."team_role" AS ENUM('owner', 'member', 'viewer');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"session_id" varchar(64) NOT NULL,
	"visitor_id" varchar(64),
	"timestamp" timestamp DEFAULT now(),
	"pathname" text NOT NULL,
	"referrer" text,
	"origin" text,
	"utm_source" varchar(64),
	"utm_medium" varchar(64),
	"utm_campaign" varchar(64),
	"utm_term" varchar(64),
	"utm_content" varchar(64),
	"event_type" varchar(64) NOT NULL,
	"event_name" varchar(128),
	"event_data" jsonb,
	"browser_name" varchar(64),
	"browser_version" varchar(64),
	"os_name" varchar(64),
	"os_version" varchar(64),
	"device_type" varchar(64),
	"user_agent" text,
	"duration" integer,
	CONSTRAINT "analytics_events_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "project_api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"public_key" varchar(128) NOT NULL,
	"secret_key" varchar(256) NOT NULL,
	"revoked" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"revoked_at" timestamp,
	CONSTRAINT "project_api_keys_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "project_api_keys_public_key_unique" UNIQUE("public_key"),
	CONSTRAINT "project_api_keys_secret_key_unique" UNIQUE("secret_key")
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "project_role" DEFAULT 'viewer',
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(64) NOT NULL,
	"description" text,
	"user_id" uuid,
	"team_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "projects_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "projects_slug_team_id_unique" UNIQUE("slug","team_id"),
	CONSTRAINT "projects_slug_user_id_unique" UNIQUE("slug","user_id")
);
--> statement-breakpoint
CREATE TABLE "team_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"email" varchar(256) NOT NULL,
	"role" "team_role" DEFAULT 'member',
	"status" "invite_status" DEFAULT 'pending',
	"invited_at" timestamp DEFAULT now(),
	"accepted_at" timestamp,
	CONSTRAINT "team_invites_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "team_role" DEFAULT 'member',
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(64) NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "teams_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "teams_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" text DEFAULT 'user',
	"subscription_type" text DEFAULT 'free',
	CONSTRAINT "user_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_project_id_projects_uuid_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_api_keys" ADD CONSTRAINT "project_api_keys_project_id_projects_uuid_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_uuid_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_user_uuid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_user_uuid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_team_id_teams_uuid_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_team_id_teams_uuid_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_uuid_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_user_uuid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_owner_id_user_uuid_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;