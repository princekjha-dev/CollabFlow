# CollabFlow

CollabFlow is a full-stack collaboration app for managing projects and tasks in real time. It pairs a Next.js/React frontend with an Express/TypeScript REST API, PostgreSQL via Prisma, JWT authentication, Socket.IO for live updates, and AWS S3 for file attachments.

## What it includes

- Next.js frontend with login, dashboard, and project/task views
- Secure authentication flows with JWT access and refresh tokens
- Project management with ownership, membership, and invitation flows
- Task CRUD for tracking status, priority, due dates, and assignees
- Task comments and team-level collaboration support
- Real-time project and task updates via Socket.IO
- File and image attachments on tasks via AWS S3
- Production-ready server setup with Vercel-compatible export support

## Key Features

- **Frontend:** login/register pages, dashboard with project overview, task board with status/priority/assignee views
- **Authentication:** register, login, logout, refresh token, current user — enforced on both API routes and frontend pages
- **Project APIs:** list, create, update, delete, invite members
- **Task APIs:** list, create, read, update, delete, comment, file attachment upload
- **Realtime:** Socket.IO room joins and live project/task updates, no polling
- **Storage:** task attachments uploaded to AWS S3
- **Validation and error handling** with Zod and centralized middleware
- **API-first approach** with clean route structure under `/api`

## Tech stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS

**Backend**
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication
- Socket.IO real-time messaging
- Zod validation
- AWS S3 (file storage)
- Helmet and CORS for production-ready HTTP security
- Vercel Node serverless-friendly deployment

## Repository structure

- `frontend/` — Next.js app (pages, components, API client, auth handling)
- `src/app.ts` — application factory and middleware setup
- `src/server.ts` — local development entrypoint
- `src/routes/` — Express route definitions
- `src/controllers/` — request handling logic
- `src/services/` — business rules and database operations
- `src/middleware/` — auth, validation, and error handling
- `src/utils/` — JWT helpers, Socket utilities, and S3 client
- `prisma/` — data model and migrations
- `api/` — Vercel serverless entrypoint

## Getting started

### 1. Install dependencies

```bash
# backend
npm install

# frontend
cd frontend && npm install
```

### 2. Create environment file

```bash
cp .env.example .env
```

Update `.env` with your database connection, JWT secrets, and AWS S3 credentials (bucket name, access key, secret key, region).

### 3. Generate Prisma client

```bash
npx prisma generate
```

### 4. Run migrations

```bash
npx prisma migrate dev --name init
```

### 5. Start development servers

```bash
# backend
npm run dev

# frontend (separate terminal)
cd frontend && npm run dev
```

The backend starts on the port defined in `.env`; the frontend runs on the default Next.js dev port and talks to the backend API.

## Build for production

```bash
# backend
npm run build

# frontend
cd frontend && npm run build
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
- `POST /api/tasks/:taskId/attachments` — uploads a file to S3 and links it to the task

## Local development notes

- The backend uses `src/server.ts` for local development and `api/index.ts` for Vercel deployment.
- `src/app.ts` exports the Express app as the default export for compatibility with serverless platforms.
- The frontend lives in `frontend/` and expects the backend API URL in its own `.env.local`.
- Use `POST /api/auth/login` to obtain tokens and `GET /api/auth/me` to verify authentication.

## Deployment

This project includes a `vercel.json` file and `api/index.ts` entrypoint for backend deployment on Vercel. The `frontend/` app deploys separately as its own Vercel project.

### Recommended deployment steps

1. Push the branch to GitHub
2. Deploy the backend as one Vercel project (root directory), and `frontend/` as a second Vercel project
3. Set environment variables in both Vercel projects (DB connection, JWT secrets, S3 credentials, and API URL for the frontend)
4. Deploy

## Notes

CollabFlow started as a backend-only foundation and has since grown a real Next.js frontend and S3-backed file attachments. Known gaps / next steps: role-based permissions beyond owner/member, a shared UI component library (styling is currently per-page Tailwind), and notifications.
