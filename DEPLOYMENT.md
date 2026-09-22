# Deploying to AWS

This project runs as one Docker Compose stack: 8 backend microservices, Postgres, and a single
`frontend` container (nginx) that serves the React app **and** reverse-proxies every API call.
Only the `frontend` container publishes ports (80/443) - nothing else is reachable from the
internet, which is also what fixes the "temporary redirect" / "not found" errors you were seeing:
those came from the browser calling `localhost:800x` directly, or from routes that only matched
with a trailing slash.

## 1. First-time server setup (EC2 Ubuntu)

```bash
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin git
sudo usermod -aG docker $USER
# log out and back in so the group membership takes effect
```

**Security group**: open inbound TCP 80 and 443 (and 22 for SSH). Nothing else needs to be open -
Postgres and the 8 APIs are not published, so opening 8000-8007 is neither necessary nor safe.

## 2. Get the code onto the server

```bash
git clone <your-repo-url> lms && cd lms
```

## 3. Configure and start

```bash
./scripts/deploy.sh
```

The first run creates `.env` from `.env.example` with fresh random secrets and stops so you can
check it. Open `.env` and, if you have a domain, set `SERVER_NAME` to it. Then run
`./scripts/deploy.sh` again - it builds every image and starts the stack.

`docker compose ps` should show all 9 containers as `healthy` within about a minute (Postgres
needs to come up first; every service retries automatically). Visit `http://<your-server-ip>` or
`http://<your-domain>` - the app should load and API calls should work.

## 4. Enable HTTPS (optional, recommended)

Point your domain's DNS A record at the server's IP first. Then:

```bash
sudo apt-get install -y certbot
docker compose stop frontend          # frees port 80 for certbot's own web server
sudo certbot certonly --standalone -d your-domain.com
docker compose up -d frontend
```

nginx checks for a certificate at container start and switches to HTTPS automatically - no
config edit needed. Confirm it: `curl -I https://your-domain.com`.

**Renewal** (Let's Encrypt certificates expire every 90 days) - add a cron job on the host:

```bash
echo "0 3 * * * root certbot renew --quiet --pre-hook 'docker compose -f $(pwd)/docker-compose.yml stop frontend' --post-hook 'docker compose -f $(pwd)/docker-compose.yml up -d frontend'" | sudo tee /etc/cron.d/certbot-renew
```

## 5. Verify

```bash
./scripts/smoke-test.sh https://your-domain.com
```

This checks that the SPA loads, that every API prefix reaches its service with no redirect, and
that unauthenticated requests get a proper 401/403 rather than the login page's HTML.

## 6. Redeploying after a code change

```bash
git pull
docker compose up -d --build
```

Compose only rebuilds and restarts the services whose image actually changed. Your database
(`postgres_data` volume) and uploaded files (bind-mounted from `backend/*/uploads`) are untouched.

## Day-to-day operations

```bash
docker compose ps                       # status + health of every container
docker compose logs -f auth_service     # tail one service's logs
docker compose logs -f                  # tail everything
docker compose restart module_lesson_service   # restart just one service
docker compose down                     # stop everything (keeps the database volume)
```

**Backups**: the two things worth keeping off the server are the Postgres volume and the upload
folders.
```bash
docker compose exec postgres pg_dumpall -U postgres > backup-$(date +%F).sql
tar czf uploads-backup-$(date +%F).tar.gz backend/module_lesson/uploads backend/assessments/uploads
```

## Local development

`docker-compose.yml` is production only. For local development, with hot-reload and every
service published on `localhost:800x`, use `docker-compose.dev.yml` instead:

```bash
docker compose -f docker-compose.dev.yml up --build
cd frontend && cp .env.example .env && npm install && npm run dev
```

## How routing works (for reference)

`frontend/nginx/lms/routes.conf` maps URL prefixes to services:

| Prefix                                              | Service              |
|------------------------------------------------------|-----------------------|
| `/auth`                                               | auth_service          |
| `/api/courses`                                        | course_service        |
| `/modules`                                            | module_lesson_service |
| `/progress`                                           | progress_service      |
| `/assignments`, `/assessments`, `/questions`           | assessment_service    |
| `/grading`                                             | marking_grading_service |
| `/sessions`                                            | scheduling_service    |
| `/notifications`                                       | notification_service  |
| `/uploads/...`, `/static/questions/...`                 | whichever service stored the file |
| anything else                                          | the React app (client-side routing) |

Every prefix matches with or without a trailing slash, so `/modules` and `/modules/` both reach
the API - this is what was causing the 307 redirects you saw before.

## Troubleshooting

- **"upstream not found" / 502 on one route** - `docker compose ps`: that container is probably
  still starting or has crashed. `docker compose logs <service>` shows why.
- **A container is `unhealthy`** - check its logs; usually a missing environment variable
  (`docker compose config` prints every variable's final resolved value) or the database not
  being ready yet (it retries, so this normally clears on its own within ~30s).
- **Changed `JWT_SECRET_KEY`** - every existing login/refresh token stops working immediately;
  this is expected, not a bug. Users need to log in again.
- **HTTPS didn't activate** - `docker compose logs frontend | grep lms-nginx` prints which mode
  it chose and why; it falls back to HTTP if no certificate is found for `SERVER_NAME`.
