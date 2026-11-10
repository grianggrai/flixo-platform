# FLIXO Authentication and RBAC Setup

## Required environment

Frontend `frontend/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy anon key)
- `NEXT_PUBLIC_API_BASE_URL`

Backend `backend/.env`:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` (or legacy anon key)
- `CORS_ORIGINS` set to exact frontend origin(s)

Only a publishable/anon key is used for user-scoped requests in this phase. Never put a Supabase secret/service-role key in frontend variables.

## Database migration sequence

Apply in ascending filename order:
1. `0001_initial.sql`
2. `0002_auth_profile_trigger.sql`
3. `0003_episode_publication_policy.sql`
4. `0004_auth_rbac_content_workflows.sql`
5. `0005_null_safe_role_checks.sql`
6. `0006_authenticated_rbac_policies.sql`

New accounts get role `viewer`. Signup metadata cannot grant elevated privileges.

## Provisioning roles

Creator/editor/admin privileges must be granted by a trusted operator in the Supabase SQL Editor. Replace the placeholder with the verified Auth user UUID:

```sql
update public.profiles set role = 'creator' where id = '<AUTH_USER_UUID>';
update public.profiles set role = 'editor' where id = '<AUTH_USER_UUID>';
update public.profiles set role = 'admin' where id = '<AUTH_USER_UUID>';
```

There is intentionally no self-service role escalation API.

## Runtime protections

- Next.js 16 `proxy.ts` refreshes cookie sessions using Supabase SSR and verified JWT claims.
- Creator and Admin server layouts read the profile role under RLS before rendering protected UI.
- FastAPI validates bearer tokens with Supabase Auth and loads the caller's profile role.
- Postgres RPC functions re-check roles inside the transaction.
- Creator submission creates `pending` content and leaves `rights_verified=false`.
- Editorial approval creates `approved` content; it does not publish or verify IP rights.

## Manual verification

1. Sign up a Viewer; confirm profile role is `viewer`.
2. Confirm Viewer calls to Creator/Admin APIs return 403.
3. Promote a test account to `creator`; submit a series and confirm it is `pending`.
4. Confirm Creator cannot publish or modify roles.
5. Promote a second account to `editor`; review the submission.
6. Confirm approval does not set `rights_verified=true` or `status='published'`.
7. Confirm Creator cannot call the review RPC.
8. Confirm public catalog only returns published and rights-cleared series.

Before production, complete independent security review, rate limiting, observability, operational backup and recovery tests.
