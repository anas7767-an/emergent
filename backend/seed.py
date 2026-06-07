"""
FERI Wholesale — standalone seed script.

Usage:
    cd backend
    cp .env.example .env        # (and edit if needed)
    pip install -r requirements.txt
    python seed.py              # seed everything (idempotent)
    python seed.py --reset      # wipe DB collections first, then seed

What gets seeded (from `seed_data.py`):
    • 4 retailer accounts (verified + 1 pending KYC), each with credit limit
    • 4 brand accounts
    • 10 wholesale products with category, MRP, wholesale price, margin, MOQ
    • 5 sample orders with credit entries

Default passwords: test123 for all retailers / brands
Admin login: phone=admin / password=feri@2025 (hardcoded in server.py — no DB row)

After running this, start the server with:
    uvicorn server:app --reload --host 0.0.0.0 --port 8001
"""
import argparse
import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import bcrypt
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load env from .env next to this script
load_dotenv(Path(__file__).parent / ".env")

# Local imports
from seed_data import SEED_USERS, SEED_PRODUCTS, SEED_ORDERS_SPEC, SEED_VERSION  # noqa: E402


MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "feri_wholesale")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def next_id(db, collection: str) -> int:
    res = await db.counters.find_one_and_update(
        {"_id": collection},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    return int(res["seq"])


# ---------------------------------------------------------------------------
# Seed steps
# ---------------------------------------------------------------------------
async def ensure_indexes(db):
    await db.users.create_index([("phone", 1), ("role", 1)], unique=True)
    await db.users.create_index("id", unique=True)
    await db.products.create_index("id", unique=True)
    await db.products.create_index("category")
    await db.orders.create_index("id", unique=True)
    await db.orders.create_index("retailer_id")
    await db.credits.create_index("retailer_id", unique=True)
    await db.credit_entries.create_index("retailer_id")


async def seed_users(db):
    created = 0
    for u in SEED_USERS:
        existing = await db.users.find_one({"phone": u["phone"], "role": u["role"]})
        if existing:
            if not verify_password(u["password"], existing.get("password_hash", "")):
                await db.users.update_one(
                    {"_id": existing["_id"]},
                    {"$set": {"password_hash": hash_password(u["password"])}},
                )
            continue
        uid = await next_id(db, "users")
        doc = {k: v for k, v in u.items() if k != "password"}
        doc["id"] = uid
        doc["password_hash"] = hash_password(u["password"])
        doc["created_at"] = now_iso()
        await db.users.insert_one(doc)
        created += 1
    print(f"  ✓ Users:    {created} new, {len(SEED_USERS) - created} already existed")


async def seed_products(db):
    if await db.products.count_documents({}) > 0:
        print(f"  · Products already present ({await db.products.count_documents({})}) — skipping")
        return

    brand_map = {}
    async for b in db.users.find({"role": "brand"}):
        brand_map[b["brand_name"]] = b["id"]

    for p in SEED_PRODUCTS:
        pid = await next_id(db, "products")
        doc = dict(p)
        doc["id"] = pid
        doc["brand_id"] = brand_map.get(p.get("brand_name"))
        if "margin_percent" not in doc and doc.get("mrp"):
            doc["margin_percent"] = round((doc["mrp"] - doc["wholesale_price"]) / doc["mrp"] * 100, 1)
        doc.setdefault("stock_status", "in_stock")
        doc.setdefault("is_approved", True)
        doc.setdefault("popularity", 0)
        doc.setdefault("created_at", now_iso())
        await db.products.insert_one(doc)
    await db.meta.update_one({"_id": "seed_version"}, {"$set": {"value": SEED_VERSION}}, upsert=True)
    print(f"  ✓ Products: {len(SEED_PRODUCTS)} inserted")


async def seed_sample_orders(db):
    if await db.orders.count_documents({}) > 0:
        print(f"  · Orders already present ({await db.orders.count_documents({})}) — skipping")
        return

    retailers = {u["phone"]: u async for u in db.users.find({"role": "retailer"})}
    inserted = 0
    for spec in SEED_ORDERS_SPEC:
        retailer = retailers.get(spec["retailer_phone"])
        if not retailer:
            continue
        items, total = [], 0.0
        for pname, qty in spec["products"]:
            p = await db.products.find_one({"name": pname})
            if not p:
                continue
            items.append({
                "product_id": p["id"],
                "product_name": p["name"],
                "quantity": qty,
                "unit_price": float(p["wholesale_price"]),
            })
            total += float(p["wholesale_price"]) * qty
        if not items:
            continue
        oid = await next_id(db, "orders")
        days_ago = spec.get("days_ago", 5)
        created_at = (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat()
        await db.orders.insert_one({
            "id": oid,
            "retailer_id": retailer["id"],
            "retailer_name": retailer.get("shop_name") or retailer.get("name"),
            "retailer_city": retailer.get("city"),
            "items": items,
            "total_amount": total,
            "payment_type": spec.get("payment_type", "net_30"),
            "status": spec.get("status", "delivered"),
            "delivery_date": spec.get("delivery_date"),
            "created_at": created_at,
        })
        inserted += 1

        if spec.get("payment_type", "net_30") != "pay_now":
            days_map = {"net_15": 15, "net_30": 30, "net_60": 60}
            days = days_map.get(spec.get("payment_type", "net_30"), 30)
            cid = await next_id(db, "credit_entries")
            await db.credit_entries.insert_one({
                "id": cid,
                "retailer_id": retailer["id"],
                "order_id": oid,
                "amount": total,
                "due_date": (datetime.fromisoformat(created_at) + timedelta(days=days)).isoformat(),
                "status": spec.get("credit_status", "pending"),
                "created_at": created_at,
            })
            if spec.get("credit_status") != "paid":
                await db.credits.update_one(
                    {"retailer_id": retailer["id"]},
                    {
                        "$inc": {"used_amount": total},
                        "$setOnInsert": {"credit_limit": float(retailer.get("credit_limit") or 50000)},
                    },
                    upsert=True,
                )
    print(f"  ✓ Orders:   {inserted} sample orders + credit entries inserted")


async def reset_db(db):
    print("  ! Wiping collections: users, products, orders, credit_entries, credits, counters, meta")
    for coll in ("users", "products", "orders", "credit_entries", "credits", "counters", "meta"):
        await db[coll].delete_many({})


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
async def main(reset: bool):
    print(f"→ Connecting to MongoDB at {MONGO_URL}  (db={DB_NAME})")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    try:
        # Ping
        await client.admin.command("ping")
    except Exception as e:
        print(f"✗ Cannot reach MongoDB: {e}", file=sys.stderr)
        sys.exit(1)

    if reset:
        await reset_db(db)

    print("→ Ensuring indexes")
    await ensure_indexes(db)

    print("→ Seeding")
    await seed_users(db)
    await seed_products(db)
    await seed_sample_orders(db)

    print("\n✅ Seed complete!\n")
    print("Test credentials:")
    print("  Retailer  →  phone=9876543210  password=test123  (Sharma Kirana Store, Nashik)")
    print("  Brand     →  phone=9800000001  password=test123  (Raj Foods)")
    print("  Admin     →  username=admin    password=feri@2025  (hardcoded — no DB row)")
    client.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed FERI Wholesale MongoDB")
    parser.add_argument("--reset", action="store_true", help="Wipe collections before seeding")
    args = parser.parse_args()
    asyncio.run(main(reset=args.reset))
