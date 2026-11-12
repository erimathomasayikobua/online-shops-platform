# Deploying the backend to Railway

The API is a plain Node/Express service backed by MySQL, so it runs on Railway's
Nixpacks builder with no Dockerfile. The repository ships the deploy configuration
as code (`railway.json`), a health endpoint, deploy-time migrations and
environment auto-detection for Railway's MySQL variables.

```
Railway project: erim platform / production
├── MySQL          ← managed MySQL 8 + volume
└── api            ← this Express backend (create this service)
```

---

## 0. Security status — read before exposing the API publicly

The API currently authenticates with **unsigned demo tokens**. Two consequences:

- Protected endpoints are not actually protected. `/api/auth/*` issues
  `demo-token-<userId>` and `getAuthUser` simply parses the id out of that string,
  so anyone can send `Authorization: Bearer demo-token-<userId>` and be treated as
  that user.
- Most admin and merchant routes (`/api/admin/*`, `/api/merchant/*`,
  `/api/customer-care/*`) have **no auth middleware at all** and will answer
  unauthenticated requests.

Until JWT signing plus `requireAuth` / `requireRole` middleware are implemented,
treat a public domain as **read/write access for anyone who finds it**. Options
while that work is pending:

- Keep the service off public networking (Railway private networking only), or
- Put it behind Railway's basic auth / an IP allow-list, or
- Deploy it to a staging environment that holds no real data.

`JWT_SECRET` is already read by the app and will be used once signing lands. Set
it now so the value is in place, but do not assume it protects anything yet.

---

## 1. Branches and prerequisites

Deployments track **`main`**. The repository also has an older branch named
`origin`; keep it in sync or delete it after merging your work into `main`.

1. **Point Railway at `main`.** The source branch is a Railway *service setting*; it
   cannot be set from `railway.json`, and changing the GitHub default branch does
   **not** retarget a service that was already created (the fork point is stored on
   the service).

   - **Existing service:** Railway → `api` service → **Settings → Source → Branch** →
     select `main` → **Redeploy**. Once it tracks `main`, deployments show
     `main@<sha>` instead of `origin@<sha>`.
   - **New service:** set GitHub → **Settings → Branches → Default branch** to `main`
     first, then create the service, so it tracks `main` from the start.
   - **Without the dashboard:** the same change is available through Railway's
     GraphQL API (`serviceUpdate` on the service's `source.branch`) using an account
     token. The CLI does not expose source settings.
2. **Push your work.** Railway builds from GitHub, never from your machine:
   ```bash
   git checkout main
   git merge <your-branch>      # or cherry-pick / open a PR
   git push origin main
   ```
3. **Node version.** `engines.node` is `>=20`. If Railway resolves an older runtime,
   set `NODE_VERSION=22` as a service variable.

---

## 2. Create the API service

Railway → your project → **New → GitHub Repo → `online-shops-platform`**.

The repo root contains `railway.json`, which builds only the backend workspace:

| Setting | Value |
|---|---|
| Build command | `npm install --workspace backend --omit=dev` |
| Start command | `npm run start --workspace backend` |
| Pre-deploy command | `npm run db:migrate --workspace backend && npm run db:create-admin --workspace backend` |
| Healthcheck | `/api/health` (timeout 120 s) |

**Alternative:** set the service's **Root Directory** to `backend`. Railway then
picks up [`backend/railway.json`](../backend/railway.json), whose commands are the
same minus the workspace flags. Use one approach, not both.

> Pre-deploy commands are not available on every plan. If yours doesn't support
> them, remove `preDeployCommand` from the config and run the migrations manually
> once (see “Manual alternative”).

---

## 3. Connect the database

Railway's MySQL service injects connection variables only into services that
reference them.

API service → **Variables** → **Add Reference** → `MySQL` → `MYSQL_URL`
(or add a variable named `MYSQL_URL` with the value `${{MySQL.MYSQL_URL}}`).

[`backend/src/config/env.js`](../backend/src/config/env.js) resolves the database
configuration from, in order:

1. a connection URL — `MYSQL_URL`, `MYSQL_PRIVATE_URL`, `DATABASE_URL`, `DB_URL`, then
2. discrete variables — `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`,
   `MYSQLDATABASE`, then
3. the local `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME`.

So referencing `MYSQL_URL` alone is enough. Do **not** also define `DB_*` on the
service: a URL and the `DB_*` block can disagree, and `DB_*` wins — that is the
most common “connected to the wrong database” bug.

Use the **private** URL inside Railway (`mysql.railway.internal`, or the
service's internal hostname). It needs no TLS. The **public** proxy
(`*.rlwy.net`) exists only for connections from your own machine and does
require TLS:

```
DB_SSL=true
```

---

## 4. Environment variables

| Variable | Value | Why |
|---|---|---|
| `MYSQL_URL` | `${{MySQL.MYSQL_URL}}` | Database connection (reference, not a literal) |
| `NODE_ENV` | `production` | Hides internal error details, enables proxy trust, blocks demo seeding |
| `JWT_SECRET` | random 48-byte string | Reserved for token signing; see section 0 |
| `FRONTEND_URLS` | `https://admin.example.com,https://shop.example.com` | CORS allow-list (comma separated, origins only) |
| `PORT` | usually injected | Only set it if the platform doesn't provide one; it must match the port public networking targets |
| `DEFAULT_ADMIN_PASSWORD` | optional | Temporary password for `admin@erim.ug` at creation time |
| `NODE_VERSION` | `22` | optional runtime pin |
| `DB_POOL_SIZE` | `10` | optional pool size |
| `DB_CONNECT_RETRIES` | `5` | optional boot retry count |
| `DB_CONNECT_RETRY_DELAY_MS` | `3000` | optional delay between retries |
| `DB_SSL` | `true` | only for TLS-required hosts such as the public proxy |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

If `FRONTEND_URLS` is empty in production the API still boots, but browsers will
block cross-origin calls — a warning is printed at startup. Entries are origins
only; trailing slashes are stripped, paths are not.

---

## 5. Deploy

Railway builds the image, runs the pre-deploy command, then starts the container.

Sequence against a fresh database:

1. `npm run db:migrate` → creates `schema_migrations` plus **18 application
   tables**. Migrations are tracked per file, so re-running is a no-op.
2. `npm run db:create-admin` → creates `admin@erim.ug` (`Super Admin`, `all`
   permissions) with `must_change_password = 1`. It is idempotent: if the account
   exists nothing changes, so a password that was already rotated is never reset.
3. The container starts and must answer `GET /api/health` within 120 s. The API
   retries the database connection five times (3 s apart) before giving up, which
   covers a database that is still starting.

The MySQL **Data** tab shows “You have no tables” until the pre-deploy step
finishes — refresh it after the deploy turns green. To inspect from the CLI:

```bash
railway connect MySQL     # opens a mysql shell on the database
SHOW TABLES;              # expect 19 rows: 18 tables + schema_migrations
```

**Networking → Generate Domain** to publish the API. The app binds `HOST`
(default `0.0.0.0`) and `PORT` injected by Railway. If Railway asks which port the
app listens on, use the value of `PORT`; if it injects none, set `PORT=8080`
yourself and target that port.

### Manual alternative

```bash
npm i -g @railway/cli
railway login
railway link                 # select project, environment and the api service
railway run npm run db:migrate --workspace backend      # run from the repo root
railway run npm run db:create-admin --workspace backend
```

`railway run` executes the command **locally** with the service's variables
injected; `railway connect` executes against the remote service.

---

## 6. Verify the deployment

```bash
curl https://<api-domain>/api/health
```

Expected:

```json
{ "status": "OK", "service": "online-shops-platform", "database": "Operational", "environment": "production", "timestamp": "…" }
```

Then confirm the admin account exists and is forced through a password change:

```bash
curl -X POST https://<api-domain>/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@erim.ug\",\"password\":\"Erim-Admin-2026\"}"
```

The response contains `"requiresPasswordChange": true`. If you set
`DEFAULT_ADMIN_PASSWORD` before the account was created, use that value instead of
the `Erim-Admin-2026` default. Log in through the admin panel to set the permanent
password.

---

## 7. Point the frontends at the API

Each Vite app reads `VITE_API_URL` **at build time**, so it must be present when the
frontend is built:

```
VITE_API_URL=https://<api-domain>/api
```

Set it on each frontend service (or in `.env` for local builds), redeploy so the
bundle picks it up, then add those frontend origins to `FRONTEND_URLS` on the API
service. Changing `VITE_API_URL` without a rebuild leaves the old URL baked into
the bundle.

---

## 8. Work against the hosted database from your machine

Copy the MySQL service's **public** URL (`MYSQL_PUBLIC_URL`) into `backend/.env`:

```
DB_URL=mysql://root:password@roundhouse.proxy.rlwy.net:12345/railway
DB_SSL=true
```

The internal `MYSQL_URL` (`mysql.railway.internal`) does **not** resolve from your
laptop — only the public proxy does.

Then `cd backend && npm run db:migrate` works against Railway. A URL wins over the
`DB_HOST` block, but remove the local `DB_*` values anyway so it is obvious which
database is targeted.

---

## 9. Never seed production

`npm run db:seed` **truncates every table** before loading demo data. It refuses to
run when `NODE_ENV=production` unless you pass `--force`. Demo accounts
(`customer@erim.test`, `pass123`, …) must never exist on a public deployment.

---

## 10. Deployment checklist

- [ ] Work merged into `main` and pushed; GitHub default branch is `main`
- [ ] MySQL service running, `MYSQL_URL` referenced in the API service
- [ ] `NODE_ENV=production`, `JWT_SECRET`, `FRONTEND_URLS` set
- [ ] Deploy green; `/api/health` returns `database: "Operational"`
- [ ] `SHOW TABLES` returns 18 tables + `schema_migrations`
- [ ] `admin@erim.ug` exists and forces a password change
- [ ] Public domain generated (ideally kept private until auth is enforced)
- [ ] Frontends rebuilt with `VITE_API_URL=https://<api-domain>/api`

---

## 11. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Crash loop: `Could not connect to MySQL at 127.0.0.1:3306` | No database URL reached the container, so the localhost fallback was used. Reference `MYSQL_URL` from the MySQL service. |
| `ECONNREFUSED …mysql.railway.internal` | MySQL is stopped, or the API and the database are in different projects/environments. |
| `ER_ACCESS_DENIED_ERROR` | Stale credentials — re-copy `MYSQL_URL` after a password rotation. |
| `ER_BAD_DB_ERROR` | Migrations never ran, or the database name in the URL is not the one that exists. |
| Healthcheck failure / 502 | The container never bound the expected port. Check the start logs for `Commerce API running on 0.0.0.0:<port>` and set `PORT` to match public networking. |
| Browser `CORS` error | `FRONTEND_URLS` missing, or an entry includes a path/trailing slash. Use origins only, e.g. `https://admin.up.railway.app`. |
| `SSL routines` / `self signed certificate` | You are on the public proxy without TLS. Add `DB_SSL=true`. |
| Deploy fails on the pre-deploy step | Pre-deploy commands unsupported on the plan, or MySQL was not ready. Remove `preDeployCommand` and run migrations with `railway run`. |
| Data looks like demo fixtures in production | Someone ran `db:seed` with `--force`. Restore from a backup and rotate credentials. |

Logs: Railway → api service → **Deployments → View Logs**, or `railway logs`.
At boot the API prints the resolved database target (user@host:port/database — the
password is never logged) and the public URL it is serving.
