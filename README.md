# Supametrics: A Unified Analytics Platform 🚀

Supametrics is a robust, developer-focused analytics platform designed to provide insightful data with a minimal, premium interface. This monorepo project combines a powerful Next.js dashboard, a high-performance Hono (TypeScript) API for user and project management, and an efficient Go Fiber API for real-time analytics ingestion. It's built for precision, self-hosting, and scalability, empowering developers to understand their applications' usage patterns. Supametrics aims to be a privacy-first, open-source web analytics solution, offering a lightweight and privacy-friendly alternative to Google Analytics, designed for self-hosting and complete data ownership.

## Features

-   **Real-time Analytics Ingestion**: Efficiently logs and tracks analytics events via a dedicated Go Fiber API, secured by public API keys, supporting batched ingestion and caching hot data in Redis.
-   **Comprehensive User & Project Management**: Manage users, create and organize projects, and oversee teams through a robust Hono (TypeScript) API. Includes CRUD operations for projects and teams, inviting users to teams and projects, and assigning roles.
-   **Secure Authentication & Authorization**: Implements email/password authentication with JWT and refresh tokens, supports OAuth (Google, GitHub), role-based access control (user, admin, superadmin for users; owner, member, viewer for teams/projects), session management (revoke, list, expire), and account restriction (suspended, read-only).
-   **API Key Management**: Secure generation, rotation, and revocation of public and secret API keys for each project to control external access, with project-scoped access and enforcement.
-   **Intelligent Rate Limiting & Quotas**: Protects against abuse and enforces plan-based usage limits (free, paid, enterprise) for both API requests and monthly event quotas, utilizing Redis for caching and rate-limiting.
-   **Dynamic Reporting & Analytics Retrieval**: Generate and retrieve custom reports based on collected analytics data (e.g., event summaries, OS, device, browser summaries, top paths, referrers, hostnames, UTM sources), with secret key access for project owners and pagination for large datasets.
-   **Modern Interactive Dashboard**: A sleek Next.js dashboard provides a visually appealing and highly responsive interface for data visualization, powered by Tailwind CSS, shadcn/ui, and Framer Motion.
-   **Subscription Plan Enforcement**: Support for multiple user plans (free, paid, enterprise) with usage tracking (project count, team count) and plan upgrades/downgrades.
-   **Admin Capabilities**: (Roadmap) Includes viewing user logs, suspending/restricting user accounts, audit log access, and a system metrics dashboard for super admins.

## Stacks / Technologies

| Category         | Technology                                                            | Purpose                                                                 | Link                                                                                    |
| :--------------- | :-------------------------------------------------------------------- | :---------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **Monorepo**     | [Turborepo](https://turbo.build/repo)                                 | High-performance build system for JavaScript and TypeScript monorepos   | [Turborepo.com](https://turbo.build/repo)                                               |
|                  | [npm Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces) | Manages multiple packages within a single root project                  | [npmjs.com](https://docs.npmjs.com/cli/v10/using-npm/workspaces)                        |
| **Frontend**     | [Next.js](https://nextjs.org/)                                        | React framework for building user interfaces                            | [Nextjs.org](https://nextjs.org/)                                                       |
|                  | [React](https://react.dev/)                                           | JavaScript library for building interactive UIs                         | [React.dev](https://react.dev/)                                                         |
|                  | [Tailwind CSS](https://tailwindcss.com/)                              | Utility-first CSS framework for rapid styling                           | [Tailwindcss.com](https://tailwindcss.com/)                                             |
|                  | [shadcn/ui](https://ui.shadcn.com/)                                   | Reusable UI components based on Radix UI and Tailwind CSS               | [Ui.shadcn.com](https://ui.shadcn.com/)                                                 |
|                  | [Framer Motion](https://www.framer.com/motion/)                       | Animation library for smooth UI transitions                             | [Framer.com](https://www.framer.com/motion/)                                            |
|                  | [Lucide Icons](https://lucide.dev/)                                   | Modern icon set for the dashboard                                       | [Lucide.dev](https://lucide.dev/)                                                       |
|                  | [Tabler Icons React](https://tabler-icons-react.vercel.app/)          | Another icon set used for specific components                           | [Tabler-icons-react.vercel.app](https://tabler-icons-react.vercel.app/)                 |
|                  | [Axios](https://axios-http.com/)                                      | Promise-based HTTP client for the browser and Node.js                   | [Axios-http.com](https://axios-http.com/)                                               |
|                  | [Sonner](https://sonner.emilkowal.ski/)                               | Accessible toast library for notifications                              | [Sonner.emilkowal.ski](https://sonner.emilkowal.ski/)                                   |
|                  | [next-themes](https://www.npmjs.com/package/next-themes)              | Manages theme switching (light/dark mode)                               | [npmjs.com](https://www.npmjs.com/package/next-themes)                                  |
|                  | [Zustand](https://zustand-store.app/)                                 | Small, fast, and scalable bearbones state-management solution           | [Zustand-store.app](https://zustand-store.app/)                                         |
|                  | [@tanstack/react-query](https://tanstack.com/query/latest)            | Data-fetching and state management for React                            | [Tanstack.com](https://tanstack.com/query/latest)                                       |
| **Backend (TS)** | [Hono](https://hono.dev/)                                             | Web framework for building fast APIs with TypeScript                    | [Hono.dev](https://hono.dev/)                                                           |
|                  | [TypeScript](https://www.typescriptlang.org/)                         | Statically typed superset of JavaScript                                 | [Typescriptlang.org](https://www.typescriptlang.org/)                                   |
|                  | [Node.js](https://nodejs.org/en)                                      | JavaScript runtime environment                                          | [Nodejs.org](https://nodejs.org/en)                                                     |
|                  | [Drizzle ORM](https://orm.drizzle.team/)                              | TypeScript ORM for PostgreSQL database interactions                     | [Orm.drizzle.team](https://orm.drizzle.team/)                                           |
|                  | [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)            | JSON Web Token implementation for authentication                        | [npmjs.com](https://www.npmjs.com/package/jsonwebtoken)                                 |
|                  | [bcrypt-ts](https://www.npmjs.com/package/bcrypt-ts)                  | TypeScript-first bcrypt implementation for password hashing             | [npmjs.com](https://www.npmjs.com/package/bcrypt-ts)                                    |
|                  | [nanoid](https://www.npmjs.com/package/nanoid)                        | Tiny, secure, URL-friendly, unique string ID generator                  | [npmjs.com](https://www.npmjs.com/package/nanoid)                                       |
|                  | [Zod](https://zod.dev/)                                               | TypeScript-first schema declaration and validation library              | [Zod.dev](https://zod.dev/)                                                             |
| **Backend (Go)** | [Go](https://go.dev/)                                                 | Programming language for building efficient and reliable software       | [Go.dev](https://go.dev/)                                                               |
|                  | [Fiber](https://gofiber.io/)                                          | Express.js-inspired web framework for Go                                | [Gofiber.io](https://gofiber.io/)                                                       |
|                  | [github.com/google/uuid](https://pkg.go.dev/github.com/google/uuid)   | Package for UUID generation                                             | [pkg.go.dev](https://pkg.go.dev/github.com/google/uuid)                                 |
|                  | [github.com/joho/godotenv](https://github.com/joho/godotenv)          | GoDotEnv for loading environment variables from `.env` files            | [Github.com](https://github.com/joho/godotenv)                                          |
|                  | [github.com/lib/pq](https://github.com/lib/pq)                        | PostgreSQL driver for Go's database/sql package                         | [Github.com](https://github.com/lib/pq)                                                 |
|                  | [github.com/redis/go-redis/v9](https://github.com/redis/go-redis/v9)  | Redis client for Go                                                     | [Github.com](https://github.com/redis/go-redis/v9)                                      |
| **Database**     | [Neon PostgreSQL](https://neon.tech/)                                 | Serverless PostgreSQL database for persistent storage                   | [Neon.tech](https://neon.tech/)                                                         |
|                  | [Redis](https://redis.io/)                                            | In-memory data store for caching, rate-limiting, and session management | [Redis.io](https://redis.io/)                                                           |
| **Tooling**      | [TypeScript](https://www.typescriptlang.org/)                         | Superset of JavaScript for type safety                                  | [Typescriptlang.org](https://www.typescriptlang.org/)                                   |
|                  | [ESLint](https://eslint.org/)                                         | Pluggable JavaScript linter                                             | [Eslint.org](https://eslint.org/)                                                       |
|                  | [Prettier](https://prettier.io/)                                      | Opinionated code formatter                                              | [Prettier.io](https://prettier.io/)                                                     |
|                  | [tsx](https://www.npmjs.com/package/tsx)                              | TypeScript execution environment for Node.js                            | [npmjs.com](https://www.npmjs.com/package/tsx)                                          |

## Installation

Follow these steps to set up and run the Supametrics project locally.

### Prerequisites

Ensure you have Node.js (v18 or higher), npm/pnpm, and Go (v1.22 or higher) installed.

### Clone the Repository

```bash
git clone https://github.com/supametrics/supametrics.git
cd supametrics
```

### Install Dependencies

Install Node.js dependencies using pnpm (recommended by `packageManager` in `package.json`):

```bash
pnpm install
```

### Environment Variables

Each application in the monorepo requires specific environment variables. Create `.env.local` files in the respective directories (`apps/dashboard/`, `apps/hono-api/`, `apps/go-server/`) based on their `.env.example` templates.

#### `apps/hono-api/.env.local`

```dotenv
DATABASE_URL=postgresql://user:password@host:port/database # Your PostgreSQL database connection string from Neon
GOOGLE_CLIENT_ID=your-google-client-id # Google OAuth 2.0 Client ID for authentication.
GOOGLE_CLIENT_SECRET=your-google-client-secret # Google OAuth 2.0 Client Secret for authentication.
GITHUB_CLIENT_ID=your-github-client-id # GitHub OAuth App Client ID for authentication.
GITHUB_CLIENT_SECRET=your-github-client-secret # GitHub OAuth App Client Secret for authentication.
BETTER_AUTH_SECRET=your-randomly-generated-secret # Secret key used by `better-auth` for encrypting sessions. Generate with `openssl rand -base64 32`.
AUTH_SECRET=your-auth-secret # Secret key for signing JWT access tokens.
REFRESH_SECRET=your-refresh-secret # Secret key for signing JWT refresh tokens.
REDIS_URL=redis://user:password@host:port # Redis connection string (e.g., from Upstash).
TRUSTED_ORIGIN=http://localhost:3002 # Your frontend URL for CORS and OAuth redirects.
```

#### `apps/go-server/.env.local`

```dotenv
DB_URL=postgresql://user:password@host:port/database # Must be the same as hono-api's DATABASE_URL
REDIS_URL=your-upstash-redis-url # Redis connection string for Go server.
AI_REPORT_PROMPT="Your AI prompt for report generation" # Optional: AI prompt for reports.
APP_URL=https://supametrics.com,https://www.supametrics.com,https://dashboard.supametrics.com,http://localhost:3000 # Your app(s) URL, comma separated.
IP2LOCATION_DB_PATH=/path/to/GeoLite2-City.mmdb # Path to MaxMind GeoLite2 City database for GeoIP lookups.
```

#### `apps/dashboard/.env.local`

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3004 # URL for the Hono API backend.
```

### Database Setup

The Hono API uses Drizzle ORM for PostgreSQL. Run migrations to set up your database schema:

1.  Navigate to the `hono-api` directory:
    ```bash
    cd apps/hono-api
    ```
2.  Run Drizzle migrations (ensure your `DATABASE_URL` is set in `.env.local`):
    ```bash
    npx drizzle-kit push:pg
    ```
    (Note: If `drizzle-kit` is not globally installed, use `pnpm drizzle-kit` or install it with `npm install -g drizzle-kit`)

### Running Services

Supametrics is a monorepo managed with Turborepo. You can run all services concurrently or individually.

1.  **Start the Hono API (TypeScript Backend)**:
    Navigate to the root of the monorepo and run:

    ```bash
    pnpm dev --filter=hono-api
    ```
    The Hono API will run on `http://localhost:3004`.

2.  **Start the Go Server (Analytics Ingestion Backend)**:
    Navigate to the `apps/go-server` directory and run:

    ```bash
    go run main.go
    ```
    The Go server will run on `http://localhost:3005`.

3.  **Start the Next.js Dashboard (Frontend)**:
    Navigate to the root of the monorepo and run:
    ```bash
    pnpm dev --filter=dashboard
    ```
    The Next.js dashboard will be accessible at `http://localhost:3002`.

## Usage

Once all services are running, you can interact with the platform:

### Dashboard Access

Navigate to `http://localhost:3002` in your web browser. From there, you can:

-   **Sign Up / Log In**: Create a new account or log in using email/password or OAuth (if configured).
-   **Manage Projects**: Create new projects, view existing ones, manage API keys, and invite team members.
-   **View Analytics**: Explore overview statistics, project-specific analytics (page views, custom events, device/OS/browser summaries, top paths, referrers, UTM sources, countries, cities), and generated reports. The dashboard provides a visual representation of the data ingested by the Go analytics server.

### API Reference

Supametrics exposes two distinct API services: the main Hono API for core functionalities and the Go Fiber API for high-volume analytics ingestion.

#### Base URLs

-   **Hono API (Core Services)**: `http://localhost:3004/api/v1`
-   **Go Fiber API (Analytics Ingestion)**: `http://localhost:3005/api/v1`

#### Key Endpoints

-   **Hono API (`http://localhost:3004/api/v1`)**:
    -   `POST /auth/signup`: User registration.
    -   `POST /auth/signin`: User login.
    -   `GET /session`: Get current user session.
    -   `GET /session/signout`: Log out user.
    -   `POST /projects/new`: Create a new project.
    -   `GET /projects`: List user's projects.
    -   `GET /projects/:id`: Get details for a specific project.
    -   `POST /projects/:id/rotate-key`: Generate new API keys for a project.
    -   `DELETE /projects/:id`: Delete a project.
    -   `POST /projects/:id/invite`: Invite a user to a project.
    -   `GET /projects/:id/members`: List project members.
    -   `DELETE /projects/:id/leave`: Leave a project.
    -   `GET /overview`: Get an overview of user statistics (total projects, reports, visitors).
    -   `GET /analytics/:id`: Fetch analytics data for a project (requires project membership).
    -   `GET /analytics/:id/events/list`: Get a list of all tracked events for a project.
    -   `GET /reports/:id`: Retrieve reports for a specific project.

-   **Go Fiber API (`http://localhost:3005/api/v1`)**:
    -   `POST /analytics/log`: Log analytics events (requires `X-Public-Key` header).
    -   `GET /analytics/project`: Retrieve aggregated analytics for a project (requires `X-Private-Key` header).
    -   `GET /analytics/project/:eventName`: Retrieve aggregated analytics for a specific event (requires `X-Private-Key` header).

## Contributing

We welcome contributions to Supametrics! To contribute:

1.  **Fork the repository** and clone it locally.
2.  Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name`.
3.  Make your changes, ensuring they adhere to the project's coding standards.
4.  Run tests and ensure all checks pass.
5.  Commit your changes with a clear, descriptive message (e.g., `feat: Add new feature X`, `fix: Resolve bug Y`).
6.  Push your branch: `git push origin feature/your-feature-name`.
7.  Open a pull request against the `main` branch, detailing your changes.

### Code Style

This project uses TypeScript, React, Next.js, Hono, and Go. Please adhere to the existing patterns and practices. ESLint and Prettier configurations are provided in the `packages/eslint-config` and `packages/tailwind-config` directories, respectively, to help maintain a consistent code style.

## License

This project is licensed under the MIT License.

## Author Info

Connect with the author of Supametrics:

-   **Email**: treasureuzoma650@gmail.com
-   **X**: [@idolodev](https://twitter.com/idolodev)

[![Readme was generated by Readmit](https://img.shields.io/badge/Readme%20was%20generated%20by-Readmit-brightred)](https://readmit.vercel.app)
