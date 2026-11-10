# FLIXO

FLIXO is a short-form and episodic video streaming platform MVP.

## MVP scope

- Viewer: home, discovery, series detail, player shell, library, profile, wallet and VIP
- Creator: creator landing, dashboard and series submission UI
- Admin: review queue, series, creator and rights-management UI
- Backend: FastAPI REST API scaffold
- Data: Supabase PostgreSQL schema and baseline row-level security policies
- Delivery: GitHub Actions CI for backend syntax and frontend build

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

The MVP is a modular monolith. The frontend currently uses sample content. FastAPI wallet endpoints intentionally fail closed until authentication and transactional ledger services are implemented.

## Local development

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

API health check: `GET http://localhost:8000/api/v1/health`

## Supabase

Apply migrations in `supabase/migrations/` to a Supabase project after reviewing the policies. The SQL is a starting point; test RLS with separate viewer, creator, editor and admin identities before exposing production data.

## Production readiness

This repository is an MVP scaffold, not a production-certified streaming service. Still required:
- Supabase Auth integration, server-side role checks and protected Creator/Admin routes
- Production catalog queries, creator media upload and moderation lifecycle
- Video provider integration, signed playback URLs and DRM/licensing decisions
- Payment checkout, verified webhooks, idempotent wallet posting and reconciliation
- Creator revenue calculation, payout operations and audit review
- Automated integration/security tests, observability, backup/restore and deployment configuration

The wallet, payments and playback are demo/disabled paths. No real money is accepted and no real video is streamed by this scaffold.
