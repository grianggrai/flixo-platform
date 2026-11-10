# FLIXO Deployment Guide

This guide prepares the scaffold for deployment. It does not create or configure cloud resources.

## Frontend — Vercel

1. Import `grianggrai/flixo-platform` into Vercel.
2. Set the project root directory to `frontend`.
3. Framework preset: Next.js.
4. Configure:
   - `NEXT_PUBLIC_APP_NAME=FLIXO`
   - `NEXT_PUBLIC_API_BASE_URL=https://<your-api-host>`
   - `NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<public-anon-key>`
5. Deploy a Preview environment first. Promote to Production only after the acceptance and security checks are complete.

## Backend — Docker-compatible host

Build from the repository root:

```bash
docker build -f backend/Dockerfile -t flixo-api ./backend
docker run --rm -p 8000:8000 --env-file backend/.env flixo-api
```

Configure these environment variables in the backend service:
- `APP_ENV`
- `API_PORT` or platform-provided `PORT`
- `CORS_ORIGINS` (exact frontend origin(s), no wildcard with credentials)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (backend secret only; never expose to browser/client)

Health endpoint: `GET /api/v1/health`.

## Supabase

1. Create separate development and production projects.
2. Apply migrations in ascending filename order.
3. Test RLS using separate viewer, creator, editor and admin accounts.
4. Verify account bootstrap, suspension behavior, access to unpublished content and access to another user's wallet.
5. Keep the service-role key only in server-side secret storage.

## Go-live gates

Do not enable real payments or creator payouts until webhook signatures, provider event idempotency, transactional wallet posting, reversals/refunds and reconciliation are implemented and tested. Do not serve real video until signed playback URLs, rights validation and storage access controls are implemented. Admin and Creator pages must be protected by server-side authorization before the application is exposed to real users.
