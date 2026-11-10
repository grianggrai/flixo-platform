from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_auth_me_requires_bearer_token():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_creator_endpoint_requires_authentication():
    response = client.get("/api/v1/creator/series")
    assert response.status_code == 401


def test_admin_endpoint_requires_authentication():
    response = client.get("/api/v1/admin/reviews")
    assert response.status_code == 401


def test_wallet_stays_disabled_without_authentication():
    response = client.get("/api/v1/wallet")
    assert response.status_code == 401
