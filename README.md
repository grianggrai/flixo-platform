# FLIXO

FLIXO is a short-form and episodic video streaming platform MVP.

## MVP scope

- Viewer: discovery, series detail, playback shell, library, profile, wallet and VIP pages
- Creator: creator dashboard and series submission workflow
- Admin: creator, series, content review and rights-management screens
- Backend: FastAPI REST API scaffold
- Data: Supabase PostgreSQL migrations
- Delivery: GitHub Actions CI baseline

## Architecture

```text
Viewer / Creator / Admin (Next.js)
              |
          FastAPI API
              |
     Supabase PostgreSQL
              |
   Video provider / Payments
```

The MVP is structured as a modular monolith. Payment, video delivery and authentication integrations must be configured and security-tested before production use.

## Repository layout

- `frontend/` — Next.js application
- `backend/` — FastAPI application
- `supabase/migrations/` — database migrations
- `docs/` — product acceptance criteria and delivery notes

## Production readiness

This is an MVP starter, not a production-certified service. Before launch, complete authentication and authorization, Supabase RLS review, atomic wallet ledger operations, payment webhook signature verification and idempotency, signed video playback, observability, automated tests, backup/restore drills and deployment configuration.
