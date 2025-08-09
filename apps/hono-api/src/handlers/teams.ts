import { Hono } from "hono";
import { db } from "../db";
import { teams, teamMembers, teamInvites } from "../db/schema";
import { user } from "../db/auth-schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { getUserOrThrow } from "../lib/project-helpers";

const teamRoutes = new Hono();

// GET /teams - all teams user is in
teamRoutes.get("/", async (c) => {
  const currentUser = await getUserOrThrow(c);

  const results = await db
    .select({ team: teams, role: teamMembers.role })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.uuid))
    .where(eq(teamMembers.userId, currentUser.uuid));

  return c.json({
    success: true,
    teams: results.map((r) => ({ ...r.team, role: r.role })),
  });
});

// POST /teams - create new team (only for paid users)
teamRoutes.post("/", async (c) => {
  const currentUser = await getUserOrThrow(c);

  if (currentUser.subscriptionType === "free") {
    return c.json({ error: "Upgrade to Pro to create teams" }, 403);
  }

  const { name } = await c.req.json();
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const [team] = await db
    .insert(teams)
    .values({
      uuid: nanoid(),
      name,
      slug,
      ownerId: currentUser.uuid,
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.uuid,
    userId: currentUser.uuid,
    role: "owner",
  });

  return c.json({ success: true, team });
});

// POST /teams/join/:inviteId - join a team via invite URL
teamRoutes.post("/join/:inviteId", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const inviteId = c.req.param("inviteId");

  const [invite] = await db
    .select()
    .from(teamInvites)
    .where(eq(teamInvites.uuid, inviteId));

  if (!invite || invite.status !== "pending") {
    return c.json({ error: "Invalid or expired invite" }, 400);
  }

  if (invite.email.toLowerCase() !== currentUser.email.toLowerCase()) {
    return c.json({ error: "Invite not for this user" }, 403);
  }

  await db.insert(teamMembers).values({
    teamId: invite.teamId,
    userId: currentUser.uuid,
    role: invite.role,
  });

  await db
    .update(teamInvites)
    .set({ status: "accepted", acceptedAt: new Date() })
    .where(eq(teamInvites.uuid, inviteId));

  return c.json({ success: true });
});

// POST /teams/:id/invite - send invite (only owner or member)
teamRoutes.post("/:id/invite", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const teamId = c.req.param("id");
  const { email, role } = await c.req.json();

  if (!["owner", "member", "viewer"].includes(role)) {
    return c.json({ error: "Invalid role" }, 400);
  }

  // Check current user is in the team
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, currentUser.uuid))
    .where(eq(teamMembers.teamId, teamId));

  if (!membership || membership.role === "viewer") {
    return c.json({ error: "Not allowed to invite" }, 403);
  }

  const [invite] = await db
    .insert(teamInvites)
    .values({
      uuid: nanoid(),
      teamId,
      email,
      role,
    })
    .returning();

  return c.json({
    success: true,
    inviteUrl: `${process.env.APP_URL}/teams/join/${invite.uuid}`,
    message: `Invite created for ${email} with role ${role}`,
  });
});

export default teamRoutes;
