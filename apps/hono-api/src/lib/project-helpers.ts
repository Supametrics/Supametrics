import type { Context } from "hono";
import { db } from "../db";
import { projects, projectMembers } from "../db/schema";
import { eq, and } from "drizzle-orm";
import type { AuthType } from "./auth";

export async function getUserOrThrow(c: Context<{ Variables: AuthType }>) {
  const user = c.get("user");
  if (!user) throw c.json({ error: "Unauthorized" }, 401);
  return user;
}

export async function getProjectOrThrow(projectId: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.uuid, projectId));
  if (!project)
    throw new Response(JSON.stringify({ error: "Project not found" }), {
      status: 404,
    });
  return project;
}

export async function getProjectMembership(projectId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    );
  return membership;
}

export async function isAdmin(projectId: string, userId: string) {
  const membership = await getProjectMembership(projectId, userId);
  return membership?.role === "admin";
}

export async function isOwnerOrAdmin(project: any, userId: string) {
  if (project.userId === userId) return true;
  const membership = await getProjectMembership(project.uuid, userId);
  return membership?.role === "admin";
}
