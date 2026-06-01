# Supametrics Internal API 🚀

## Overview

This project is a high-performance backend API built with Hono and TypeScript, designed to provide comprehensive analytics, user, team, and project management. It leverages Drizzle ORM for type-safe interaction with a PostgreSQL database (Neon) and utilizes Redis for robust caching and rate limiting, ensuring efficient and scalable operations.

## Features

-   **Authentication & Authorization**: Secure user authentication via email/password. It includes robust JWT-based session management with refresh tokens and role-based access control (RBAC). The project's roadmap also outlines support for OAuth (Google, GitHub) authentication.
-   **User & Profile Management**: APIs for creating, managing, and updating user profiles, including user status (active, suspended, read-only), and email verification.
-   **Team Management**: Functionality to create and manage teams, including inviting members with specific roles (owner, member, viewer). Supports creating team-owned projects and managing team membership.
-   **Project Management**: Comprehensive APIs for creating, listing, updating, and deleting projects, supporting both personal and team-based ownership. Projects can have defined types (web, mobile, backend) and their unique slugs are automatically generated and managed.
-   **API Key Management**: Secure generation, rotation, and revocation of API keys (public and secret) for each project to control external access to analytics data.
-   **Real-time Analytics Collection**: Capture and aggregate various analytics events such as page views, visitor IDs, UTM parameters, browser/OS/device information, and event-specific data (e.g., `cta_clicked`). Tracks pathname, referrer, hostname, country, and city.
-   **Data Reporting**: Generate and retrieve custom reports based on collected analytics data for projects. Reports include details like name, description, type, and associated data payload.
-   **Rate Limiting**: Implements Redis-backed rate limiting using user agent and IP to protect API endpoints from abuse and ensure service stability across different routes.
-   **Scalable Data Storage**: Utilizes a PostgreSQL database (Neon Serverless) for reliable and scalable data persistence, managed through Drizzle ORM.
-   **Efficient Caching**: Integrates Redis for high-speed data caching and transient storage for sessions and rate limiting.
-   **Flexible Access Control**: Supports distinct roles for team members (owner, member, viewer) and project members (admin, editor, viewer), allowing granular permissions.

## Stacks / Technologies

| Technology                 | Purpose                                                 | Link                                                                                   |
| :------------------------- | :------------------------------------------------------ | :------------------------------------------------------------------------------------- |
| Hono                       | Fast, lightweight web framework                         | [Hono.dev](https://hono.dev/)                                                          |
| TypeScript                 | Statically typed superset of JavaScript                 | [TypeScriptLang.org](https://www.typescriptlang.org/)                                  |
| Drizzle ORM                | Type-safe Node.js ORM for SQL databases                 | [DrizzleORM.com](https://orm.drizzle.team/)                                            |
| PostgreSQL (Neon)          | Serverless, scalable relational database                | [Neon.tech](https://neon.tech/)                                                        |
| Redis                      | In-memory data store for caching and rate limiting      | [Redis.io](https://redis.io/)                                                          |
| Better Auth                | Flexible and secure authentication library              | [BetterAuth](https://www.npmjs.com/package/better-auth)                                |
| Zod                        | TypeScript-first schema declaration and validation      | [Zod.dev](https://zod.dev/)                                                            |
| `bcrypt-ts`                | Password hashing library                                | [NPM bcrypt-ts](https://www.npmjs.com/package/bcrypt-ts)                               |
| `jsonwebtoken`             | JSON Web Token implementation                           | [NPM jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)                         |
| `nanoid`                   | Tiny, secure, URL-friendly unique string ID generator   | [NPM Nano ID](https://www.npmjs.com/package/nanoid)                                    |
| `@hono/node-server`        | Node.js adapter for Hono applications                   | [NPM @hono/node-server](https://www.npmjs.com/package/@hono/node-server)               |
| `@neondatabase/serverless` | Serverless driver for Neon PostgreSQL                   | [NPM @neondatabase/serverless](https://www.npmjs.com/package/@neondatabase/serverless) |
| `dotenv`                   | Loads environment variables from a `.env` file          | [NPM dotenv](https://www.npmjs.com/package/dotenv)                                     |
| `crypto`                   | Node.js built-in module for cryptographic functionality | [Node.js Crypto](https://nodejs.org/api/crypto.html)                                   |

## Installation

### Prerequisites

Ensure you have Node.js (v18 or higher) and npm/yarn installed.

### Environment Variables

All required environment variables must be configured in a `.env` file in the project root. You can start by copying `.env.example` and filling in the values:

```bash
cp .env.example .env
```

| Variable               | Example                                         | Description                                                                                        |
| :--------------------- | :---------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | `postgresql://user:password@host:port/database` | Your PostgreSQL database connection string (e.g., from Neon).                                      |
| `GOOGLE_CLIENT_ID`     | `your-google-client-id`                         | Google OAuth 2.0 Client ID for authentication.                                                     |
| `GOOGLE_CLIENT_SECRET` | `your-google-client-secret`                     | Google OAuth 2.0 Client Secret for authentication.                                                 |
| `GITHUB_CLIENT_ID`     | `your-github-client-id`                         | GitHub OAuth App Client ID for authentication.                                                     |
| `GITHUB_CLIENT_SECRET` | `your-github-client-secret`                     | GitHub OAuth App Client Secret for authentication.                                                 |
| `BETTER_AUTH_SECRET`   | `your-randomly-generated-secret`                | Secret key used by `better-auth` for encrypting sessions. Generate with `openssl rand -base64 32`. |
| `AUTH_SECRET`          | `your-auth-secret`                              | Secret key for signing JWT access tokens.                                                          |
| `REFRESH_SECRET`       | `your-refresh-secret`                           | Secret key for signing JWT refresh tokens.                                                         |
| `REDIS_URL`            | `redis://user:password@host:port`               | Redis connection string (e.g., from Upstash).                                                      |
| `TRUSTED_ORIGIN`       | `http://localhost:3002`                         | Your frontend URL for CORS and OAuth redirects.                                                    |

### Database Migrations (Drizzle ORM)

After setting `DATABASE_URL`, ensure your database schema is up-to-date:

1.  **Install Drizzle Kit**: If not already installed globally or locally:
    ```bash
    npm install drizzle-kit --save-dev
    # or
    yarn add drizzle-kit --dev
    ```
2.  **Generate Migration**: This command will create new migration files based on changes in your schema.
    ```bash
    npx drizzle-kit generate:pg
    ```
3.  **Apply Migration**: This command will push the latest schema changes to your database.
    ```bash
    npx drizzle-kit push:pg
    ```
    _Note_: The project's `package.json` includes a `migrate:event-types` script (`tsx scripts/migrate-event-types.ts`), which suggests specialized migrations may also exist. Ensure to run any necessary custom migration scripts as per project documentation.

### Local Development

1.  **Install Dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This command uses `tsx` to watch for changes and restart the server automatically. The API will be available at `http://localhost:3004`.

### Production Build

1.  **Build Project**:
    ```bash
    npm run build
    # or
    yarn build
    ```
    This compiles the TypeScript code to JavaScript in the `dist/` directory.
2.  **Start Production Server**:
    ```bash
    npm run start
    # or
    yarn start
    ```
    This command runs the compiled application. The API will be available on the port configured in your environment variables (default: `3004`).

## Usage

Once the server is running, you can interact with the API using the documented endpoints. The base URL for all API endpoints is `http://localhost:3004/api/v1` (or your deployed domain).

## API Documentation

The provided codebase defines several API routes, accessible under the `/api/v1` base path:

-   **`GET /health`**: Checks the server's health. (Rate-limited: 5 requests/minute).
-   **`POST /auth/*`**: Authentication routes for user sign-up, sign-in, and password management. (Rate-limited: 15 requests/hour).
    -   `POST /auth/signup`: Register a new user with name, email, and password.
    -   `POST /auth/signin`: Authenticate a user with email and password, issuing access and refresh tokens.
    -   `POST /auth/forgot-password`: Initiates a password reset process by sending a link to the user's email.
    -   `POST /auth/verify-reset-password`: Resets the user's password using a valid token.
-   **`GET /session`**: Retrieves current user session information, including associated teams. (Requires authentication, Rate-limited: 90 requests/hour).
-   **`GET /session/signout`**: Invalidates the current user session and clears authentication cookies. (Requires authentication).
-   **`GET /profile`**: Fetches the authenticated user's profile details. (Requires authentication, Rate-limited: 90 requests/hour).
-   **`PATCH /profile`**: Updates the authenticated user's profile information. (Requires authentication, Rate-limited: 90 requests/hour).
-   **`POST /projects/new`**: Creates a new project, which can be personal or team-owned. (Requires authentication, Rate-limited: 100 requests/hour).
-   **`GET /projects`**: Lists projects accessible to the authenticated user, with filtering, searching, and pagination options. (Requires authentication, Rate-limited: 100 requests/hour).
-   **`GET /projects/:id`**: Retrieves details for a specific project, including API keys if the user has appropriate roles. (Requires authentication, Rate-limited: 100 requests/hour).
-   **`POST /projects/:id/rotate-key`**: Generates and replaces the API keys for a given project. (Requires authentication as admin/owner, Rate-limited: 100 requests/hour).
-   **`DELETE /projects/:id`**: Deletes a project. (Requires authentication as project owner or team admin, Rate-limited: 100 requests/hour).
-   **`POST /projects/:id/invite`**: Invites a user to a project or updates an existing member's role. (Requires authentication as project admin, Rate-limited: 100 requests/hour).
-   **`PATCH /projects/:id/role`**: Updates a project member's role. (Requires authentication as project admin, Rate-limited: 100 requests/hour).
-   **`PATCH /projects/:id`**: Updates project details such as name, description, URL, and type. (Requires authentication as project owner or admin, Rate-limited: 100 requests/hour).
-   **`GET /projects/:id/members`**: Lists all members associated with a specific project. (Requires authentication, Rate-limited: 100 requests/hour).
-   **`DELETE /projects/:id/members/:userId`**: Removes a member from a project. (Requires authentication as project admin, Rate-limited: 100 requests/hour).
-   **`DELETE /projects/:id/leave`**: Allows a non-admin user to leave a project. (Requires authentication, Rate-limited: 100 requests/hour).
-   **`GET /overview`**: Provides an aggregate overview of projects, reports, and visitor statistics. Supports filtering by personal or team projects. (Requires authentication, Rate-limited: 100 requests/hour).
-   **`GET /analytics/:id`**: Fetches detailed analytics data for a specific project, including visitor trends, browser/OS/device summaries, top paths, and referrers. Supports various time filters and event types. (Requires authentication, Rate-limited: 50 requests/hour).
-   **`GET /analytics/:id/events/list`**: Retrieves a list of all unique events recorded for a project, along with their counts and last seen timestamps. (Requires authentication, Rate-limited: 50 requests/hour).
-   **`GET /reports/:id`**: Fetches a list of reports for a given project, with pagination. (Requires authentication, Rate-limited: 50 requests/hour).
-   **`GET /teams`**: Lists all teams the authenticated user is a member of. (Requires authentication, Rate-limited: 50 requests/hour).
-   **`POST /teams`**: Creates a new team. (Requires authentication and a paid subscription, Rate-limited: 50 requests/hour).
-   **`PATCH /teams/:id`**: Updates the name of a specific team. (Requires authentication as team owner, Rate-limited: 50 requests/hour).
-   **`DELETE /teams/:id/members/:memberId`**: Removes a member from a team. (Requires authentication as team owner, Rate-limited: 50 requests/hour).
-   **`POST /teams/:id/invite`**: Invites a user to a team. (Requires authentication as team owner, Rate-limited: 50 requests/hour).
-   **`GET /teams/:id/members`**: Lists all members of a specific team. (Requires authentication as team member, Rate-limited: 50 requests/hour).
-   **`POST /teams/:id/leave`**: Allows a non-owner member to leave a team. (Requires authentication, Rate-limited: 50 requests/hour).

## Contributing

We welcome contributions to the Supametrics API! If you're interested in improving the project, please follow these guidelines:

1.  **Fork the repository**: Start by forking the project to your GitHub account.
2.  **Clone the repository**: Clone your forked repository to your local machine.
3.  **Create a new branch**: Create a new branch for your feature or bug fix.
    ```bash
    git checkout -b feature/your-feature-name
    ```
4.  **Make your changes**: Implement your changes, following the existing code style and conventions.
5.  **Test your changes**: Ensure your changes work as expected and do not introduce regressions. Write new tests if necessary.
6.  **Commit your changes**: Write clear and concise commit messages.
    ```bash
    git commit -m "feat: Add new feature"
    ```
7.  **Push to your branch**: Push your local branch to your forked repository.
    ```bash
    git push origin feature/your-feature-name
    ```
8.  **Open a Pull Request**: Create a pull request to the `main` branch of the original repository. Provide a detailed description of your changes.

### Code Style

This project uses TypeScript and Hono. Please adhere to the existing patterns and practices.

## License

This project is licensed under the MIT License.

## Author Info

Connect with me:

-   **Email**: [treasureuzoma650@gmail.com](mailto:hello@idolo.dev)
-   **X**: [@idolodev](https://twitter.com/idolodev)

[![Readme was generated by Readmit](https://img.shields.io/badge/Readme%20was%20generated%20by-Readmit-brightred)](https://readmit.vercel.app)
