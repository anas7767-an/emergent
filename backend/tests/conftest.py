"""Shared fixtures for FERI Wholesale backend tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fall back to frontend .env via dotenv-style read
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except FileNotFoundError:
        pass


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _login(session, phone, password, role):
    r = session.post(f"{BASE_URL}/api/auth/login",
                     json={"phone": phone, "password": password, "role": role})
    return r


@pytest.fixture(scope="session")
def retailer_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"phone": "9876543210", "password": "test123", "role": "retailer"})
    if r.status_code != 200:
        pytest.skip(f"Retailer login failed: {r.status_code} {r.text}")
    return r.json()["token"], r.json()["user"]


@pytest.fixture(scope="session")
def retailer_b_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"phone": "9876543213", "password": "test123", "role": "retailer"})
    if r.status_code != 200:
        pytest.skip(f"Retailer B login failed: {r.status_code} {r.text}")
    return r.json()["token"], r.json()["user"]


@pytest.fixture(scope="session")
def brand_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"phone": "9800000001", "password": "test123", "role": "brand"})
    if r.status_code != 200:
        pytest.skip(f"Brand login failed: {r.status_code} {r.text}")
    return r.json()["token"], r.json()["user"]


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"phone": "admin", "password": "feri@2025", "role": "admin"})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["token"], r.json()["user"]


@pytest.fixture
def retailer_client(retailer_token):
    token, _ = retailer_token
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    return s


@pytest.fixture
def retailer_b_client(retailer_b_token):
    token, _ = retailer_b_token
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    return s


@pytest.fixture
def brand_client(brand_token):
    token, _ = brand_token
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    return s


@pytest.fixture
def admin_client(admin_token):
    token, _ = admin_token
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    return s
