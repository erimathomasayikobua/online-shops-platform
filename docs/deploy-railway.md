# Deploying the backend to Railway

The API is a plain Node/Express service backed by MySQL, so it runs on Railway's
Nixpacks builder with no Dockerfile. The repository ships the deploy configuration
as code (`railway.json`), a health endpoint, deploy-time migrations and
environment auto-detection for Railway's MySQL variables.

```
Railway project: erim platform / production
├── MySQL          ← managed MySQL 8 + volume (already provisioned)
└── api            ← this Express backend (create this service)
```

---

## 1. Before you deploy

1. **Push the code.** Railway builds from GitHub, not from your machine:
   ```bash
   git add .
   git commit -m "Prepare backend for Railway"
   git push origin <your-branch>
   ```
   Note the branch name — Railway only deploys the branch selected on the service.
2. **Node version.** `engines.node` is `>=20`. If Railway picks an older runtime,
   add `NODE_VERSION=22` as a service variable.

---

## 2. Create the API service

Railway → your project → **New → GitHub Repo → `online-shops-platform`**.

The repo root contains `railway.json`, which builds only the backend workspace:

| Setting | Value |
|---|---|
| Build command | `npm install --workspace backend --omit=dev` |
| Start command | `npm run start --workspace backend` |
| Pre-deploy command | `npm run db:migrate --workspace backend && npm run db:create-admin --workspace backend` |
| Healthcheck | `/api/health` |

**Alternative:** set the service's **Root Directory** to `backend`. Railway then
picks up [`backend/railway.json`](../backend/railway.json), whose commands are the
same minus the workspace flags. Use one or the other, not both.

> If your plan does not support pre-deploy commands, delete `preDeployCommand`
> from the config and run the migrations manually once (step 5).

---

## 3. Connect the database

Railway's MySQL plugin injects connection variables only into services that
reference them.

API service → **Variables** → **Add Reference** → `MySQL` → `MYSQL_URL`
(or add `MYSQL_URL` with the value `${{MySQL.MYSQL_URL}}`).

`backend/src/config/env.js` accepts, in order:

- `MYSQL_URL` / `MYSQL_PRIVATE_URL` / `DATABASE_URL` / `DB_URL` (single URL), or
- discrete `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, or
- the local `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME`.

So referencing `MYSQL_URL` alone is enough — do **not** also set `DB_*`, because
`DB_*` takes precedence when present.

Use the private URL (`mysql.railway.internal`). The public proxy
(`*.rlwy.net`) is only for connecting from your machine, and it needs TLS:

```
DB_SSL=true
```

---

## 4. Set the required variables

| Variable | Value | Why |
|---|---|---|
| `NODE_ENV` | `production` | Hides internal error messages, enables proxy trust |
| `JWT_SECRET` | random 48-byte string | Signing secret — never ship the default |
| `FRONTEND_URLS` | `https://admin.example.com,https://shop.example.com` | CORS allow-list for deployed frontends |
| `DEFAULT_ADMIN_PASSWORD` | optional | Password for `admin@erim.ug` when it is first created |
| `NODE_VERSION` | `22` | optional runtime pin |
| `DB_POOL_SIZE` | `10` | optional connection pool size |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

If `FRONTEND_URLS` is empty in production the API still boots, but browsers will
block cross-origin calls — the log prints a warning.

---

## 5. Deploy

Railway builds, runs the pre-deploy command, then starts the container.

Sequence for a fresh database:

1. `npm run db:migrate` → creates `schema_migrations` and the 19 application tables.
2. `npm run db:create-admin` → creates `admin@erim.ug` (`Super Admin`, `all`
   permissions) with `must_change_password = 1`. It is idempotent: if the account
   already exists nothing is changed, so a rotated password is never reset.
3. Container starts and must answer `GET /api/health` within 120 s.

The MySQL **Data** tab in Railway shows "You have no tables" until the pre-deploy
step finishes — refresh after the deploy turns green.

**Networking → Generate Domain** to publish the API. If Railway asks for a port,
use the same value as the `PORT` variable (Railway injects one; the app reads it).

### Manual alternative

```bash
npm i -g @railway/cli
railway login
railway link            # select the project, environment and the api service
railway run npm run db:migrate --workspace backend
railway run npm run db:create-admin --workspace backend
```

---

## 6. Verify the deployment

```bash
curl https://<api-domain>/api/health
```

Expected:

```json
{ "status": "OK", "service": "online-shops-platform", "database": "Operational", "environment": "production" }
```

Then confirm the admin account exists and is forced through a password change:

```bash
curl -X POST https://<api-domain>/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@erim.ug\",\"password\":\"Erim-Admin-2026\"}"
```

The response contains `"requiresPasswordChange": true` and a `demo-token-…` token.
Log in through the admin panel to set the permanent password.

---

## 7. Point the frontends at the API

Each Vite app reads `VITE_API_URL` **at build time**:

```
VITE_API_URL=https://<api-domain>/api
```

Set it as a variable on each frontend service (or in `.env` for local builds),
then redeploy so the bundle picks it up. Finally add those frontend origins to
`FRONTEND_URLS` on the API service.

---

## 8. Work against the hosted database locally

Use the MySQL service's **public** URL (`MYSQL_PUBLIC_URL`) in `backend/.env`:

```
DB_URL=mysql://root:password@roundhouse.proxy.rlwy.net:PORT/railway
DB_SSL=true
```

Then `cd backend && npm run db:migrate` works against Railway from your machine.

`DB_URL`/`MYSQL_URL` wins over the `DB_HOST` block, so delete the local `DB_*`
values while you are pointed at the hosted database — mixing them is the most
common cause of "it seeded the wrong database".

---

## 9. Never seed production

`npm run db:seed` **truncates every table** before loading demo data. It now
refuses to run when `NODE_ENV=production` unless you pass `--force`. Demo accounts
(`customer@erim.test`, `pass123`, …) must never exist on a public deployment.

---

## 10. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Crash loop: `Could not connect to MySQL at 127.0.0.1:3306` | `MYSQL_URL` not referenced from the API service, so the localhost fallback is used. Add the variable reference. |
| `ECONNREFUSED …mysql.railway.internal` | Database service is down, or the API is in a different project/environment than MySQL. |
| `ER_ACCESS_DENIED_ERROR` | Stale credential — re-copy `MYSQL_URL` after a password rotation. |
| `ER_BAD_DB_ERROR` | Migrations did not run, or `DB_NAME`/`MYSQLDATABASE` points at a database the user cannot see. |
| Healthcheck failure / 502 | The container never bound `PORT`. Check deploy logs; the app reads `process.env.PORT` and binds `0.0.0.0`. |
| Browser `CORS` error | `FRONTEND_URLS` missing or has a trailing path. Use origins only, e.g. `https://admin.up.railway.app`. |
| `SSL routines` / `self signed certificate` on public proxy | Add `DB_SSL=true`. |
| Deploy fails on pre-deploy | Ad-hoc command unsupported on the plan, or MySQL not ready. Remove `preDeployCommand` and run migrations with the CLI. |

Logs: Railway → api service → **Deployments → View Logs**. The API logs the
resolved database target (host/port/name, never the password) at boot.
