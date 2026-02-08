# NextRep Backend — Structure

This document describes how the API is organized: top-level layout, request flow, domain structure (using auth as the reference), and conventions.

---

## Top-level layout (`api/`)

| Path | Purpose |
|------|--------|
| `app.js` | Entry point. Creates Express app, loads config validation, middleware (JSON, CORS, rate limit), initializes DB tables, mounts routers, starts server. |
| `config.js` | Central config. Loads `.env`, exports a single object (`jwt`, `database`, `aws`). No `process.env` elsewhere. |
| `database/` | DB pool (`db.js`), helpers (`tables.js`, `transaction.js`), and SQL table definitions (`tables/*.sql`). |
| `bucket/` | S3 client (`s3.js`) and helpers for upload, load (signed URLs), and remove. Used by assets (and profile picture). |
| `domains/` | Feature-based modules: user (auth, profile), feed (posts, replies), misc (assets). Each subdomain has routes, service, and queries. |
| `util/` | Shared code: custom errors (`backendErrors.js`), response builder (`response.js`), validation (`validation.js`), auth middleware (`middleware.js`). |

---

## Request flow

1. **Routes** (`*.routes.js`) — HTTP only. Call the service, then `res.status(response.status).json(response.body)`. Catch uncaught errors and return 500. No business logic.
2. **Service** (`*.service.js`) — Validation, orchestration, error handling. Uses config, validation, custom errors, and `CustomResponse`. Returns `{ status, body }` (via `CustomResponse(...).get()`). Catches errors from queries and maps them to responses (e.g. `err.code < 0` → custom error status/message; PG codes → 409/400; else 500).
3. **Queries** (`*.queries.js`) — Data access only. Run SQL (and S3 via bucket helpers when needed). Throw custom errors (e.g. `NotFoundError`) when there are no rows or access is denied. Optionally accept a `client` for use inside transactions.

Flow: **Route → Service → Queries** (and back: Service returns `{ status, body }`, Route sends it to the client).

---

## Domain structure (example: auth)

Each **domain** (e.g. user, feed) can contain one or more **subdomains** (e.g. auth, profile). A subdomain is a single feature area and usually has three files:

```
api/domains/user/
  user.js                 # Router that mounts auth and profile under /auth and /profile
  auth/
    auth.routes.js        # POST /sign-up, POST /login (and any other auth routes)
    auth.service.js       # signup, login, getUser — validation, JWT, CustomResponse
    auth.queries.js       # createNewUser, getUserFromKey, getUserById — DB only
  profile/
    profile.routes.js
    profile.service.js
    profile.profile.queries.js
```

**Auth folder in detail:**

- **auth.routes.js** — Thin handlers: `const response = await signup(req.body); return res.status(response.status).json(response.body);` plus catch for 500.
- **auth.service.js** — Sectioned by use case (SIGNUP, LOGIN, GET USER). Uses `validateType` and throws `ValidationError` / `ForbiddenError` for bad input or forbidden access. Calls queries; on success returns `new CustomResponse(200, message, data).get()`. In catch: PG code (e.g. 23505) → 409; `err.code < 0` (custom errors) → `err.status` and `err.message`; else 500.
- **auth.queries.js** — Sectioned by operation (CREATE USERS, GET USERS). Each function runs one or more SQL statements. No rows or “not accessible” → throw `NotFoundError`. Compound operations (e.g. create user + profile) run in a single transaction via `runTransaction` and optional `client`.

**Mounting:** In `app.js`, the user domain is mounted at `/user`, so auth routes are under `/user/auth` (e.g. `POST /user/auth/sign-up`, `POST /user/auth/login`).

---

## Other domains

- **Feed** — `feed.js` mounts `posts` and `replies` under `/feed/posts` and `/feed/replies`. Same pattern: routes → service → queries.
- **Assets** — Mounted at `/assets` in `app.js`. Routes, service, queries; service uses bucket helpers and checks visibility (user/post) before returning asset or signed URL.
- **Profile** — Under `/user/profile`. Uses auth (user id from JWT), assets (profile picture upload), and profile queries.

---

## Shared util

| File | Purpose |
|------|--------|
| `config.js` | Single source of env (jwt, database, aws). Import `config` instead of `process.env`. |
| `backendErrors.js` | Base `BackendError` and subclasses: `NotFoundError`, `ValidationError`, `ForbiddenError`, DB constraint errors, auth errors, etc. Each has `status` and optional `code`. Services use `err.code < 0` to detect custom errors and map to response. |
| `response.js` | `CustomResponse(status, message, data)`. Call `.get()` to get `{ status, body: { message, data? } }`. Omit `data` in body when null. |
| `validation.js` | `validateType(value, type, name)` — throws `ValidationError` if type doesn’t match. Used in services for input validation. |
| `middleware.js` | `requireAuth` — JWT required; attach `req.user`. `acceptAuth` — JWT optional; attach `req.user` if valid. |

---

## Database and bucket

- **database/db.js** — Single `pg` pool (from `config.database.url`). Used by all queries.
- **database/helpers/transaction.js** — `runTransaction(callback)`. Gets a client, BEGIN / COMMIT / ROLLBACK, releases client. Use for multi-step writes (e.g. user + profile, reply + count update).
- **database/helpers/tables.js** — `initTables()` runs all SQL files in `database/tables/` on startup (order by filename).
- **bucket/** — S3 client and helpers. Path pattern for assets: `assets/{owner_type}/{owner_id}/{type}`. Queries (via assets) call upload/load/remove.

---

## Conventions

1. **Responses** — Services always return `{ status, body }` via `CustomResponse(...).get()`. Routes use `response.status` and `response.body`; no ad-hoc objects.
2. **Errors** — Queries throw custom errors (`NotFoundError`, etc.). Services catch and map: `err.code < 0` → `err.status` and `err.message`; PG codes → appropriate status; else 500.
3. **Validation** — Services use `validateType` and throw `ValidationError` for bad input; catch block turns them into 400 responses.
4. **Config** — Use `config` from `config.js`; do not read `process.env` in domains or bucket.
5. **Section headers** — Use `// ======== SECTION ========` in service and query files to separate use cases or operation groups.
6. **Queries** — May run a single SQL or a transaction that combines multiple steps (e.g. create user + profile). Use `runTransaction` and pass `client` to other query helpers when needed.

---

## Adding a new endpoint or domain

- **New endpoint in an existing subdomain** — Add the route in `*.routes.js`, add the handler in `*.service.js`, and add any new query in `*.queries.js`.
- **New subdomain** — Create a folder (e.g. `domains/user/settings/`) with `settings.routes.js`, `settings.service.js`, `settings.queries.js`. Mount the router in the parent domain (e.g. `user.js`: `router.use('/settings', settingsRouter)`).
- **New domain** — Create `domains/newdomain/newdomain.js` and subfolders (e.g. `feature/` with routes, service, queries). Mount in `app.js`: `app.use('/newdomain', newdomainRouter)`.
