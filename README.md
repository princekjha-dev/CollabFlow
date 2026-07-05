# CollabFlow

CollabFlow is a polished collaboration backend with real-time task management, secure user flows, and clean API design. It is built using TypeScript, Express, Prisma, PostgreSQL, JWT authentication, and Socket.IO.

## What it includes

- Secure authentication flows with JWT access and refresh tokens
- Project management with ownership, membership, and invitation flows
- Task CRUD for tracking status, priority, due dates, and assignees
- Task comments and team-level collaboration support
- Real-time project updates via Socket.IO
- Production-ready server setup with Vercel-compatible export support
- Static landing page in `public/` for a premium blue-black product presence

## Key Features

- Authentication: register, login, logout, refresh token, current user
- Project APIs: list, create, update, delete, invite members
- Task APIs: list, create, read, update, delete, comment
- Realtime notifications: Socket.IO room joins and project updates
- Validation and error handling with Zod and centralized middleware
- API-first approach with clean route structure under `/api`

## Tech stack

- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication
- Socket.IO real-time messaging
- Zod validation
- Helmet and CORS for production-ready HTTP security
- Vercel Node serverless-friendly deployment

## Repository structure

- `src/app.ts` — application factory and middleware setup
- `src/server.ts` — local development entrypoint
- `src/routes/` — Express route definitions
- `src/controllers/` — request handling logic
- `src/services/` — business rules and database operations
- `src/middleware/` — auth, validation, and error handling
- `src/utils/` — JWT helpers and Socket utilities
- `prisma/` — data model and migrations
- `api/` — Vercel serverless entrypoint
- `public/` — static landing page and styles

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

```bash
cp .env.example .env
```

Update `.env` with your database connection and JWT secrets.

### 3. Generate Prisma client

```bash
npx prisma generate
```

### 4. Run migrations

```bash
npx prisma migrate dev --name init
```

### 5. Start development server

```bash
npm run dev
```

The backend will start on the port defined in `.env`.

## Build for production

```bash
npm run build
```

## API endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `PATCH /api/auth/me`

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `DELETE /api/projects/:projectId`
- `POST /api/projects/:projectId/invite`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`
- `POST /api/tasks/:taskId/comments`

## Local development notes

- The app uses `src/server.ts` for local development and `api/index.ts` for Vercel deployment.
- `src/app.ts` exports the Express app as the default export for compatibility with serverless platforms.
- Use `POST /api/auth/login` to obtain tokens and `GET /api/auth/me` to verify authentication.

## Deployment

This project includes a `vercel.json` file and `api/index.ts` entrypoint for Vercel deployment.

### Recommended deployment steps

1. Push the branch to GitHub
2. Add the project to Vercel
3. Set environment variables in Vercel
4. Deploy

## Design and product presentation

A modern static landing page is provided in the `public/` folder with a refined blue/black palette, premium spacing, and a business-focused layout.

## Notes

This repository is optimized as a backend foundation for a collaboration product. It can be extended with a frontend client, role-based permissions, notifications, file attachments, and dashboards.
