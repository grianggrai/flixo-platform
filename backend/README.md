# FLIXO API

FastAPI scaffold. Run locally:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Endpoints:
- `GET /api/v1/health`
- `GET /api/v1/catalog/series` (sample fixture)
- `GET /api/v1/wallet` (fails closed until auth is wired)
- `POST /api/v1/wallet/unlock` (fails closed until transactional ledger is wired)

Do not enable checkout or wallet writes until authentication, authorization, atomic ledger transactions and payment webhook verification are implemented.
