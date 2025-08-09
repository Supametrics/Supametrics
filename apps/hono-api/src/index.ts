import { serve } from "@hono/node-server";
import { Hono } from "hono";

import type { AuthType } from "./lib/auth";
import { withAuth } from "./middleware/session";

import auth from "./handlers/auth";
import projects from "./handlers/projects";
import teams from "./handlers/teams";


const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello from Hono!");
});

const v1 = new Hono<{ Variables: AuthType }>().basePath("/api/v1");

v1.use("*", withAuth);

v1.get("/health", (c) => { 
  return c.json({
    message: "Server is healthy!",
  });
});

v1.route("/auth", auth);
v1.route("/projects", projects);
v1.route("/teams", teams);

app.route("/", v1);

serve(
  {
    fetch: app.fetch,
    port: 3004,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
