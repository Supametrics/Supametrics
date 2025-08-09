import { Hono } from "hono";
import { db } from "../db";
import { projectApiKeys, projectMembers, projects, teams } from "../db/schema";
import { user } from "../db/auth-schema";
import { eq, and, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createProjectSchema } from "../lib/zod";
import { slugifyProjectName } from "../lib/slugify";
import { generateApiKeys, getPaginationParams } from "../lib/utils";
import {
  getUserOrThrow,
  getProjectOrThrow,
  getProjectMembership,
  isOwnerOrAdmin,
} from "../lib/project-helpers";
import type { AuthType } from "../lib/auth";


const projectRoutes = new Hono<{ Variables: AuthType }>();

// create new project
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

// get all projects
projectRoutes.get("/", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const userId = currentUser.uuid;
  const { page, limit, offset } = getPaginationParams(c);

  const search = c.req.query("search")?.toLowerCase() || "";
  const type = c.req.query("type"); // 'personal' | 'team' | undefined (all)

  // Fetch both types
  const owned = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId));

  const memberOf = await db
    .select({ project: projects, role: projectMembers.role })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.uuid))
    .where(eq(projectMembers.userId, userId));

  // Combine + assign role
  let allProjects = [
    ...owned.map((p) => ({ ...p, role: "owner" as const })),
    ...memberOf.map((m) => ({ ...m.project, role: m.role })),
  ];

  // filter: Search by name
  if (search) {
    allProjects = allProjects.filter((p) =>
      p.name.toLowerCase().includes(search)
    );
  }

  // filter: Personal or Team
  if (type === "personal") {
    allProjects = allProjects.filter((p) => !p.teamId);
  } else if (type === "team") {
    allProjects = allProjects.filter((p) => !!p.teamId);
  }

  // sort (e.g., most recent first)
  allProjects.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const paginated = allProjects.slice(offset, offset + limit);

  return c.json({
    success: true,
    projects: paginated,
    pagination: {
      page,
      limit,
      total: allProjects.length,
      totalPages: Math.ceil(allProjects.length / limit),
    },
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

// read overview
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

// patch (update)
projectRoutes.patch("/:id", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const projectId = c.req.param("id");
  const { name, description } = await c.req.json();

  const project = await getProjectOrThrow(projectId);

  const isAdminOrOwner = project.userId === currentUser.uuid ||
    (project.teamId &&
      (await getProjectMembership(projectId, currentUser.uuid))?.role === "admin");

  if (!isAdminOrOwner) {
    return c.json({ error: "Only admins can update project" }, 403);
  }

  await db
    .update(projects)
    .set({ ...(name && { name }), ...(description && { description }) })
    .where(eq(projects.uuid, projectId));

  return c.json({ success: true });
});

// get project members
projectRoutes.get("/:id/members", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const projectId = c.req.param("id");
  const project = await getProjectOrThrow(projectId);

  // Ensure current user is part of the project
  if (project.userId !== currentUser.uuid) {
    const membership = await getProjectMembership(projectId, currentUser.uuid);
    if (!membership) return c.json({ error: "Forbidden" }, 403);
  }

  const members = await db
    .select({
      userId: projectMembers.userId,
      role: projectMembers.role,
    })
    .from(projectMembers)
    .where(eq(projectMembers.projectId, projectId));

  // Include owner if personal project
  if (project.userId) {
    members.push({
      userId: project.userId,
      role: "owner",
    });
  }

  return c.json({ success: true, members });
});

// leave project
projectRoutes.delete("/:id/leave", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const projectId = c.req.param("id");
  const membership = await getProjectMembership(projectId, currentUser.uuid);

  if (!membership)
    return c.json({ error: "You are not a member of this project" }, 400);

  if (membership.role === "admin")
    return c.json({ error: "Admins cannot leave the project" }, 403);

  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, currentUser.uuid)
      )
    );

  return c.json({ success: true });
});

// GET /:id/analytics (read analytics)
projectRoutes.get("/:id/analytics", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const projectId = c.req.param("id");
  const project = await getProjectOrThrow(projectId);

  if (!(await getProjectMembership(projectId, currentUser.uuid)))
    return c.json({ error: "Forbidden" }, 403);

  const { limit, offset, page } = getPaginationParams(c);

  const analytics = await db
    .select()
    .from(analyticsEvents)
    .where(eq(analyticsEvents.projectId, projectId))
    .limit(limit)
    .offset(offset);

  const totalCountRes = await db
    .select({ count: db.fn.count() })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.projectId, projectId));

  const total = Number(totalCountRes[0]?.count || 0);

  return c.json({
    success: true,
    analytics,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// read by event name
projectRoutes.get("/:id/analytics/:eventName", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const projectId = c.req.param("id");
  const eventName = c.req.param("eventName");

  const project = await getProjectOrThrow(projectId);
  if (!(await getProjectMembership(projectId, currentUser.uuid)))
    return c.json({ error: "Forbidden" }, 403);

  const { limit, offset, page } = getPaginationParams(c);

  const filteredEvents = await db
    .select()
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.projectId, projectId),
        eq(analyticsEvents.eventName, eventName)
      )
    )
    .limit(limit)
    .offset(offset);

  const totalCountRes = await db
    .select({ count: db.fn.count() })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.projectId, projectId),
        eq(analyticsEvents.eventName, eventName)
      )
    );

  const total = Number(totalCountRes[0]?.count || 0);

  return c.json({
    success: true,
    eventName,
    analytics: filteredEvents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// get reports
projectRoutes.get("/:id/reports", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const projectId = c.req.param("id");
  const project = await getProjectOrThrow(projectId);

  if (!(await getProjectMembership(projectId, currentUser.uuid)))
    return c.json({ error: "Forbidden" }, 403);

  const { page, limit, offset } = getPaginationParams(c);

  const reports = await db
    .select()
    .from(db.schema.reports)
    .where(eq(db.schema.reports.projectId, projectId))
    .limit(limit)
    .offset(offset);

  const totalRes = await db
    .select({ count: db.fn.count() })
    .from(db.schema.reports)
    .where(eq(db.schema.reports.projectId, projectId));

  const total = Number(totalRes[0]?.count || 0);

  return c.json({
    success: true,
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export default projectRoutes;
