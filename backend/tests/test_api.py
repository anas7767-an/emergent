"""End-to-end backend tests for FERI Wholesale API."""
import os
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
def test_health():
    r = requests.get(f"{BASE_URL}/api/health")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class TestAuth:
    def test_retailer_login(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"phone": "9876543210", "password": "test123", "role": "retailer"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert "token" in body and isinstance(body["token"], str) and len(body["token"]) > 20
        u = body["user"]
        assert u["role"] == "retailer"
        assert u["shop_name"] == "Sharma Kirana Store"
        assert u["city"] == "Nashik"

    def test_brand_login(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"phone": "9800000001", "password": "test123", "role": "brand"})
        assert r.status_code == 200, r.text
        assert r.json()["user"]["role"] == "brand"

    def test_admin_login(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"phone": "admin", "password": "feri@2025", "role": "admin"})
        assert r.status_code == 200, r.text
        u = r.json()["user"]
        assert u["role"] == "admin"
        assert u["id"] == 0

    def test_wrong_password(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"phone": "9876543210", "password": "WRONG", "role": "retailer"})
        assert r.status_code == 401

    def test_role_mismatch(self, api):
        # Retailer phone trying brand role
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"phone": "9876543210", "password": "test123", "role": "brand"})
        assert r.status_code in (401, 403, 404)

    def test_register_retailer_and_duplicate(self, api):
        unique_phone = f"9999{int(time.time()) % 1000000:06d}"
        payload = {
            "shop_name": "TEST_Shop",
            "owner_name": "TEST Owner",
            "phone": unique_phone,
            "city": "TestCity",
            "password": "test123",
        }
        r = api.post(f"{BASE_URL}/api/auth/register-retailer", json=payload)
        assert r.status_code in (200, 201), r.text
        body = r.json()
        assert "token" in body
        assert body["user"]["phone"] == unique_phone
        assert body["user"]["role"] == "retailer"

        # Duplicate
        r2 = api.post(f"{BASE_URL}/api/auth/register-retailer", json=payload)
        assert r2.status_code == 409, r2.text

    def test_me_with_token(self, retailer_client):
        r = retailer_client.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200, r.text
        assert r.json()["role"] == "retailer"

    def test_me_without_token(self, api):
        r = api.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------
class TestProducts:
    def test_list_products(self, api):
        r = api.get(f"{BASE_URL}/api/products")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 50, f"Expected ~58 products, got {len(data)}"
        p = data[0]
        for k in ("category", "brand_name", "mrp", "wholesale_price",
                  "margin_percent", "moq", "image_url", "exchange_eligible"):
            assert k in p, f"missing field {k}: {p.keys()}"

    def test_filter_by_category(self, api):
        r = api.get(f"{BASE_URL}/api/products", params={"category": "FMCG"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        assert all(p["category"] == "FMCG" for p in data)

    def test_search_case_insensitive(self, api):
        r = api.get(f"{BASE_URL}/api/products", params={"search": "maggi"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        assert any("maggi" in p["name"].lower() for p in data)

    def test_sort_price_asc(self, api):
        r = api.get(f"{BASE_URL}/api/products", params={"sort": "price_asc"})
        assert r.status_code == 200
        prices = [p["wholesale_price"] for p in r.json()]
        assert prices == sorted(prices)

    def test_featured(self, api):
        r = api.get(f"{BASE_URL}/api/products/featured")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 8, f"Expected 8 featured products, got {len(data)}"


# ---------------------------------------------------------------------------
# Retailer endpoints
# ---------------------------------------------------------------------------
class TestRetailer:
    def test_summary(self, retailer_client):
        r = retailer_client.get(f"{BASE_URL}/api/retailer/summary")
        assert r.status_code == 200
        b = r.json()
        for k in ("total_orders", "pending_deliveries", "available_credit"):
            assert k in b

    def test_summary_requires_retailer(self, brand_client):
        r = brand_client.get(f"{BASE_URL}/api/retailer/summary")
        assert r.status_code in (401, 403)

    def test_orders_recent(self, retailer_client):
        r = retailer_client.get(f"{BASE_URL}/api/orders/recent")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) <= 5

    def test_credit(self, retailer_client):
        r = retailer_client.get(f"{BASE_URL}/api/retailer/credit")
        assert r.status_code == 200
        b = r.json()
        for k in ("credit_limit", "used_amount", "available_limit", "entries"):
            assert k in b
        assert isinstance(b["entries"], list)


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------
class TestOrders:
    def test_create_order_and_credit_deduction(self, retailer_client, api):
        # Get cheap product
        prods = api.get(f"{BASE_URL}/api/products", params={"sort": "price_asc"}).json()
        prod = prods[0]
        # Credit before
        before = retailer_client.get(f"{BASE_URL}/api/retailer/credit").json()
        avail_before = before["available_limit"]

        order_amt = prod["wholesale_price"] * prod["moq"]
        r = retailer_client.post(f"{BASE_URL}/api/orders", json={
            "items": [{"product_id": prod["id"], "quantity": prod["moq"]}],
            "payment_type": "net_30",
        })
        assert r.status_code in (200, 201), r.text
        order = r.json()
        assert "id" in order

        # Credit after — should drop
        after = retailer_client.get(f"{BASE_URL}/api/retailer/credit").json()
        assert after["available_limit"] < avail_before, f"Credit not deducted: before={avail_before}, after={after['available_limit']}"

        # Credit entry should be added
        assert len(after["entries"]) >= len(before["entries"])

    def test_insufficient_credit(self, retailer_client, api):
        prods = api.get(f"{BASE_URL}/api/products", params={"sort": "price_desc"}).json()
        prod = prods[0]
        r = retailer_client.post(f"{BASE_URL}/api/orders", json={
            "items": [{"product_id": prod["id"], "quantity": 99999}],
            "payment_type": "net_30",
        })
        assert r.status_code == 400, f"Expected 400 for insufficient credit, got {r.status_code} {r.text}"

    def test_retailer_only_sees_own_orders(self, retailer_client, retailer_b_client):
        ra = retailer_client.get(f"{BASE_URL}/api/orders").json()
        rb = retailer_b_client.get(f"{BASE_URL}/api/orders").json()
        # Get retailer IDs
        me_a = retailer_client.get(f"{BASE_URL}/api/auth/me").json()
        me_b = retailer_b_client.get(f"{BASE_URL}/api/auth/me").json()
        for o in ra:
            assert o.get("retailer_id") == me_a["id"], f"Retailer A saw order from {o.get('retailer_id')}"
        for o in rb:
            assert o.get("retailer_id") == me_b["id"]


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------
class TestAdmin:
    def test_summary(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/admin/summary")
        assert r.status_code == 200, r.text
        b = r.json()
        for k in ("total_retailers", "orders_today", "revenue_today", "active_credits"):
            assert k in b

    def test_retailers_list(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/admin/retailers")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) >= 4

    def test_kyc_patch(self, admin_client):
        retailers = admin_client.get(f"{BASE_URL}/api/admin/retailers").json()
        target = next((r for r in retailers if r.get("phone") == "9876543212"), retailers[0])
        rid = target["id"]
        r = admin_client.patch(f"{BASE_URL}/api/admin/retailers/{rid}/kyc",
                               json={"kyc_status": "verified"})
        assert r.status_code == 200, r.text

    def test_credit_limit_patch_reflects(self, admin_client):
        retailers = admin_client.get(f"{BASE_URL}/api/admin/retailers").json()
        target = next((r for r in retailers if r.get("phone") == "9876543210"), None)
        assert target is not None
        rid = target["id"]
        new_limit = 250000
        r = admin_client.patch(f"{BASE_URL}/api/admin/retailers/{rid}/credit-limit",
                               json={"credit_limit": new_limit})
        assert r.status_code == 200, r.text

        # Verify via retailer's own /credit endpoint
        rt = requests.post(f"{BASE_URL}/api/auth/login",
                           json={"phone": "9876543210", "password": "test123", "role": "retailer"}).json()["token"]
        s = requests.Session()
        s.headers.update({"Authorization": f"Bearer {rt}"})
        credit = s.get(f"{BASE_URL}/api/retailer/credit").json()
        assert credit["credit_limit"] == new_limit
