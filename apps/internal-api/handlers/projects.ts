import { Hono } from "hono";
import { db } from "../db";
import { projectApiKeys, projectMembers, projects, teams } from "../db/schema";
import { user } from "../db/auth-schema";
import { eq, and, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createProjectSchema } from "../lib/zod";
import { slugifyProjectName } from "../lib/slugify";
import { generateApiKeys } from "../lib/utils";
import {
  getUserOrThrow,
  getProjectOrThrow,
  getProjectMembership,
  // isAdmin,
  isOwnerOrAdmin,
} from "../lib/project-helpers";
import { AuthType } from "../lib/auth";

const projectRoutes = new Hono<{ Variables: AuthType }>();

// Create new project
projectRoutes.post("/new", async (c) => {
  const currentUser = await getUserOrThrow(c);

  const body = await c.req.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.format() }, 400);

  const { name, description, teamId } = parsed.data;
  const slugBase = slugifyProjectName(name);

  let finalSlug = slugBase;
  let count = 1;

  while (true) {
    const existing = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, finalSlug));
    if (existing.length === 0) break;
    finalSlug = `${slugBase}-${count++}`;
  }

  const [userInfo] = await db
    .select()
    .from(user)
    .where(eq(user.uuid, currentUser.uuid));
  if (!userInfo) return c.json({ error: "User not found" }, 404);

  if (!teamId) {
    const personalProjects = await db
      .select()
      .from(projects)
      .where(
        and(eq(projects.userId, currentUser.uuid), isNull(projects.teamId))
      );

    if (userInfo.subscriptionType === "free" && personalProjects.length >= 5)
      return c.json({ error: "Free plan limit reached" }, 403);

    const [project] = await db
      .insert(projects)
      .values({
        uuid: nanoid(),
        userId: currentUser.uuid,
        name,
        slug: finalSlug,
        description,
      })
      .returning();

    const { publicKey, secretKey } = generateApiKeys();
    await db
      .insert(projectApiKeys)
      .values({ projectId: project.uuid, publicKey, secretKey });

    return c.json({ success: true, project });
  }

  const [teamInfo] = await db
    .select()
    .from(teams)
    .where(eq(teams.uuid, teamId));
  if (!teamInfo) return c.json({ error: "Team not found" }, 404);

  const teamProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.teamId, teamId));

  if (userInfo.subscriptionType === "free" && teamProjects.length >= 5)
    return c.json(
      { error: "Team free plan limit reached (user's plan applies)" },
      403
    );

  if (userInfo.subscriptionType === "free")
    return c.json({ error: "Upgrade your account to pro to continue" }, 403);

  const [project] = await db
    .insert(projects)
    .values({ uuid: nanoid(), teamId, name, slug: finalSlug, description })
    .returning();

  await db.insert(projectMembers).values({
    projectId: project.uuid,
    userId: currentUser.uuid,
    role: "admin",
  });

  const { publicKey, secretKey } = generateApiKeys();
  await db
    .insert(projectApiKeys)
    .values({ projectId: project.uuid, publicKey, secretKey });

  return c.json({ success: true, project });
});

// Get all projects
projectRoutes.get("/", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const userId = currentUser.uuid;

  const owned = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId));
  const memberOf = await db
    .select({ project: projects, role: projectMembers.role })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.uuid))
    .where(eq(projectMembers.userId, userId));

  return c.json({
    success: true,
    projects: [
      ...owned.map((p) => ({ ...p, role: "owner" })),
      ...memberOf.map((m) => ({ ...m.project, role: m.role })),
    ],
  });
});

// Rotate key
projectRoutes.post("/:id/rotate-key", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const projectId = c.req.param("id");
  const project = await getProjectOrThrow(projectId);

  if (!(await isOwnerOrAdmin(project, currentUser.uuid)))
    return c.json({ error: "Forbidden" }, 403);

  await db
    .delete(projectApiKeys)
    .where(eq(projectApiKeys.projectId, projectId));

  const keys = generateApiKeys();
  await db.insert(projectApiKeys).values({ projectId, ...keys });

  return c.json({ success: true, apiKey: keys });
});

// Delete project
projectRoutes.delete("/:id", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const projectId = c.req.param("id");
  const project = await getProjectOrThrow(projectId);

  if (project.userId && project.userId !== currentUser.uuid)
    return c.json({ error: "Forbidden" }, 403);

  if (project.teamId) {
    const member = await getProjectMembership(project.uuid, currentUser.uuid);
    if (!member || member.role !== "admin")
      return c.json({ error: "Only admins can delete this project" }, 403);
  }

  await db.delete(projects).where(eq(projects.uuid, projectId));
  return c.json({ success: true });
});

// Read overview
projectRoutes.get("/:id", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const projectId = c.req.param("id");
  const project = await getProjectOrThrow(projectId);

  let role: "owner" | "admin" | "editor" | "viewer" = "viewer";

  if (project.userId === currentUser.uuid) {
    role = "admin";
  } else if (project.teamId) {
    const membership = await getProjectMembership(
      project.uuid,
      currentUser.uuid
    );
    if (!membership || !membership.role)
      return c.json({ error: "Not a member of this project" }, 403);
    role = membership.role;
  }

  const apiKeys =
    role === "admin" || role === "editor"
      ? await db
          .select({
            publicKey: projectApiKeys.publicKey,
            secretKey: projectApiKeys.secretKey,
            revoked: projectApiKeys.revoked,
          })
          .from(projectApiKeys)
          .where(eq(projectApiKeys.projectId, project.uuid))
      : undefined;

  return c.json({ success: true, project, role, apiKeys });
});

// Invite to project
projectRoutes.post("/:id/invite", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const projectId = c.req.param("id");
  const { email, role } = await c.req.json();

  if (!["admin", "editor", "viewer"].includes(role))
    return c.json({ error: "Invalid role" }, 400);

  const membership = await getProjectMembership(projectId, currentUser.uuid);
  if (!membership || membership.role !== "admin")
    return c.json({ error: "Only admins can invite" }, 403);

  return c.json({
    success: true,
    message: `Invite to ${email} with role ${role} created (not sent)`,
  });
});

// Edit member role
projectRoutes.patch("/:id/role", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const projectId = c.req.param("id");
  const { targetUserId, newRole } = await c.req.json();

  if (!["admin", "editor", "viewer"].includes(newRole))
    return c.json({ error: "Invalid role" }, 400);

  const membership = await getProjectMembership(projectId, currentUser.uuid);
  if (!membership || membership.role !== "admin")
    return c.json({ error: "Only admins can update roles" }, 403);

  await db
    .update(projectMembers)
    .set({ role: newRole })
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, targetUserId)
      )
    );

  return c.json({ success: true });
});

export default projectRoutes;
