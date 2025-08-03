/**
 * Internal API Roadmap – Supametrics
 *
 * Scope:
 * - Internal APIs only
 * - Central auth, user/team/project management
 * - Role-based access (user, admin, super admin)
 * - OAuth
 * - Rate limiting
 * - Plan enforcement
 * - Neon serverless database
 */

export const roadmap = {
  phases: [
    {
      phase: "Phase 1: Authentication & Authorization",
      tasks: [
        "Email/password auth with JWT + refresh tokens",
        "OAuth (Google, GitHub, etc.)",
        "Role-based access control (user, admin, super admin)",
        "User plan enforcement (free, paid, enterprise)",
        "Sessions management (revoke, list, expire)",
        "Account restriction (e.g. suspended, read-only)",
        "Middleware for auth, roles, rate limits, and plans",
      ],
    },
    {
      phase: "Phase 2: Core Features",
      tasks: [
        "Create/update/delete teams",
        "Invite users to team",
        "Assign roles within a team (owner, member, viewer)",
        "Create/update/delete projects per team",
        "Assign users to projects with scoped roles",
        "Generate/revoke API keys for project",
      ],
    },
    {
      phase: "Phase 3: Plans and Quotas",
      tasks: [
        "Support multiple user plans (free, paid, enterprise)",
        "Usage tracking (project count, team count)",
        "Plan upgrades/downgrades",
        "Stripe or billing integration for internal admin (optional)",
      ],
    },
    {
      phase: "Phase 4: Admin Capabilities",
      tasks: [
        "Impersonate user (super admin only)",
        "Suspend/restrict user accounts",
        "Audit log access",
        "System metrics dashboard",
      ],
    },
    {
      phase: "Phase 5: Infrastructure",
      tasks: [
        "Connect to Neon serverless PostgreSQL",
        "Use Redis for rate limits and sessions",
        "Set up logging and monitoring",
      ],
    },
  ],

  endpoints: {
    prefix: "/api/v1",
    auth: [
      "POST   /auth/register",
      "POST   /auth/login",
      "POST   /auth/oauth/google",
      "POST   /auth/oauth/github",
      "POST   /auth/logout",
      "POST   /auth/refresh-token",
      "GET    /auth/me",
      "GET    /auth/sessions",
      "DELETE /auth/sessions/:sessionId",
    ],
    users: [
      "GET    /users/me",
      "PATCH  /users/me",
      "DELETE /users/me (soft delete)",
      "GET    /users/:id (admin/super-admin)",
      "PATCH  /users/:id (admin/super-admin)",
      "DELETE /users/:id (admin/super-admin)",
      "POST   /users/:id/suspend (admin/super-admin)",
      "POST   /users/:id/restore",
    ],
    teams: [
      "POST   /teams",
      "GET    /teams",
      "GET    /teams/:id",
      "PATCH  /teams/:id",
      "DELETE /teams/:id",
      "POST   /teams/:id/invite",
      "POST   /teams/:id/remove-member",
      "PATCH  /teams/:id/role",
    ],
    projects: [
      "POST   /projects",
      "GET    /projects",
      "GET    /projects/:id",
      "PATCH  /projects/:id",
      "DELETE /projects/:id",
      "POST   /projects/:id/api-keys",
      "DELETE /projects/:id/api-keys/:keyId",
    ],
    plans: [
      "GET    /plans",
      "POST   /billing/subscribe",
      "POST   /billing/change-plan",
      "POST   /billing/cancel",
      "GET    /billing/usage",
    ],
    admin: [
      "GET    /admin/users",
      "GET    /admin/projects",
      "GET    /admin/teams",
      "POST   /admin/impersonate/:userId",
      "GET    /admin/logs",
      "GET    /admin/stats",
    ],
  },

  middleware: [
    "authMiddleware - Verifies JWT or session token",
    "rateLimitMiddleware - Enforces rate limits by IP/user/project",
    "roleMiddleware(['admin', 'super-admin']) - Role-based access",
    "planMiddleware - Enforces plan-level limitations",
    "teamAccessMiddleware - Verifies user access to a team",
    "projectAccessMiddleware - Verifies user access to a project",
    "suspensionCheckMiddleware - Restricts actions for suspended accounts",
  ],

  roles: ["user", "admin", "super-admin"],
  teamRoles: ["owner", "member", "viewer"],

  plans: ["free", "paid", "enterprise"],

  database: {
    primary: "Neon serverless PostgreSQL",
    tables: [
      "users",
      "sessions",
      "teams",
      "team_members",
      "projects",
      "project_keys",
      "plans",
      "roles",
      "invites",
      "audit_logs",
    ],
    cache: "Redis (sessions, rate limiting)",
  },

  testing: {
    auth: ["register/login/logout", "refresh token", "OAuth"],
    sessions: ["revoke session", "list active sessions"],
    rbac: ["role access by endpoint", "restricted user access"],
    plans: ["enforce limits", "plan change workflow"],
    teamProjectAccess: ["correct scoping of access"],
    admin: ["impersonate user", "suspend/restore user"],
  },
};
