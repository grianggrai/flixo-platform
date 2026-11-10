import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health, catalog, wallet

origins = [x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if x.strip()]
app = FastAPI(title="FLIXO API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-Id"],
)
app.include_router(health.router, prefix="/api/v1")
app.include_router(catalog.router, prefix="/api/v1")
app.include_router(wallet.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"service": "FLIXO API", "status": "ok", "docs": "/docs"}
