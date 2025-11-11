## DashForge — Copilot instructions (concise)

Purpose: help AI coding agents be immediately productive in this repository (frontend + backend monorepo).

Quick architecture summary
- This is a small monorepo with two main parts under the `DashForge/DashForge` folder:
  - `backend/` — Express + Mongoose API. Entry: `backend/index.js`. DB connect in `backend/config/db.js` (uses `process.env.MONGO_URI`).
  - `frontend/` — React (Vite) app (Entry: `frontend/src/main.jsx`, root `frontend/package.json`). Uses MUI, React Router, Redux Toolkit and Vite for dev/build.

How the pieces interact
- The frontend calls the backend at `http://localhost:5000` (see examples in `frontend/src/services/*`, e.g. `frontend/src/services/formService.js`).
- Backend mounts APIs under `/api/*` (see `backend/index.js`): `/api/auth`, `/api/form`, `/api/admin`, `/api/udf`, `/api/responses`, `/api/assignments`, `/api/mail`, `/api/user`.

Developer workflows (commands)
- Full dev (recommended): from repo root (`DashForge/DashForge`) run:
  - `npm install` (root) then `npm run dev` — runs server (nodemon) and client (vite) concurrently.
  - Equivalent partials:
    - Server only: `npm run dev --prefix backend` (or `cd backend; npm run dev`).
    - Client only: `npm run dev --prefix frontend` (or `cd frontend; npm run dev`).
- Production / build:
  - `npm run build` (from root) -> runs `frontend` build (`vite build`).
  - `npm run start` starts the backend (`node backend/index.js`). Note: the current setup does not automatically serve the frontend build from Express — the frontend preview is separate (`npm run preview --prefix frontend`).

Important files & patterns to reference
- Backend
  - `backend/index.js` — server setup and route mounting.
  - `backend/config/db.js` — Mongo connection: uses `MONGO_URI` in `.env`.
  - `backend/routes/` and `backend/controllers/` — add new endpoints by creating a route in `routes/` and corresponding logic in `controllers/` (pattern already used by `authRoutes`, `formRoutes`, etc.).
  - `backend/models/` — Mongoose models live here.
  - `backend/middleware/` — authentication/validation middlewares.

- Frontend
  - `frontend/src/services/` — HTTP clients used throughout UI (examples: `formService.js`, `userService.js`). They use absolute `http://localhost:5000/api/...` URLs.
  - `frontend/src/Pages/`, `Components/`, `UI/` — where UI and page components live.
  - `frontend/package.json` — vite scripts: `dev`, `build`, `preview`, and `lint`.

Project-specific conventions
- API pattern: backend exposes routes under `/api/<resource>`; controllers expect JWT `Authorization: Bearer <token>` headers.
- Frontend services call `http://localhost:5000` directly rather than using a relative proxy. For changes, update `frontend/src/services/*` or centralize with an `API_BASE` constant.
- Add server-side logic by pairing a file in `backend/routes/` and `backend/controllers/`. Keep DB logic in `models/` and shared utilities in `services/`.

Environment & secrets
- Backend uses `.env` in `backend/` (see `backend/.env` presence). A template is provided at `backend/.env.example` — copy to `.env` and fill values.
- Key vars discovered in code: `MONGO_URI`, `PORT`, `JWT_SECRET`, `ADMIN_SECRET`, `MAILTRAP_USER`, `MAILTRAP_PASS`, and `EMAIL_USER`.
- When adding new env usage, document it by updating `backend/.env.example`.

Small contract for edits made by AI
- Inputs: small feature/bug description, affected files or folders.
- Outputs: minimal code changes (route/controller/model/component/service), no breaks to existing `npm run dev` workflow.
- Error modes: if a new env var is required, mention it and update README or `.env.example` (do not commit secrets).

Edge cases and gotchas discovered
- Frontend uses hard-coded localhost backend URLs — running frontend/dev without backend will cause network errors; prefer running `npm run dev` at root.
- Production serving of frontend is not wired into the backend currently — deploying requires serving `frontend/dist` using a static host or adding middleware to serve static build from Express.

Where to look for examples
- Example frontend→backend call: `frontend/src/services/formService.js` (fetch to `http://localhost:5000/api/form/submit-form`).
- Example route mounting: `backend/index.js` shows all API route mount points.
- DB connect: `backend/config/db.js`.

If unsure what to change
- Run `npm run dev` locally; read server console for route errors and frontend console for network errors. When adding routes, add a unit/bare integration test where possible and mirror patterns in existing `routes/` & `controllers/`.

Next steps (when I get feedback)
- Merge or expand any missing conventions you want enforced (lint rules, branch naming, PR templates). Ask for priorities and I will iterate.

End of file — keep concise and reference the exact paths above when making edits.
