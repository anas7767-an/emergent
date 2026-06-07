"""FERI Wholesale — FastAPI backend (MongoDB)."""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# stdlib / third-party AFTER env load
import os
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

from seed_data import SEED_USERS, SEED_PRODUCTS, SEED_ORDERS_SPEC


# ---------------------------------------------------------------------------
# Mongo
# ---------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGO = "HS256"
JWT_EXP_DAYS = 30

ADMIN_PHONE = os.environ.get("ADMIN_PHONE", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "feri@2025")

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
Role = Literal["retailer", "brand", "admin"]
PaymentType = Literal["pay_now", "net_15", "net_30", "net_60"]
OrderStatusT = Literal["pending", "confirmed", "dispatched", "delivered", "exchange_requested"]
KycStatusT = Literal["pending", "verified", "rejected"]


class LoginInput(BaseModel):
    phone: str
    password: str
    role: Role


class RetailerRegisterInput(BaseModel):
    shop_name: str
    owner_name: str
    phone: str
    city: str
    password: str


class BrandRegisterInput(BaseModel):
    brand_name: str
    contact_person: str
    phone: str
    product_category: str
    password: str


class ProductInput(BaseModel):
    name: str
    category: str
    mrp: float
    wholesale_price: float
    moq: int = 1
    description: Optional[str] = None
    image_url: Optional[str] = None
    exchange_eligible: bool = False


class OrderItemInput(BaseModel):
    product_id: int
    quantity: int


class OrderInput(BaseModel):
    items: List[OrderItemInput]
    payment_type: PaymentType


class OrderStatusUpdate(BaseModel):
    status: OrderStatusT
    delivery_date: Optional[str] = None


class KycUpdate(BaseModel):
    kyc_status: KycStatusT


class CreditLimitUpdate(BaseModel):
    credit_limit: float


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


def create_token(user_id: int, role: str, phone: str) -> str:
    payload = {
        "sub": str(user_id),
        "role": role,
        "phone": phone,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXP_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def next_id(collection: str) -> int:
    """Atomic sequence counter for integer IDs."""
    res = await db.counters.find_one_and_update(
        {"_id": collection},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    return int(res["seq"])


def user_to_public(u: dict) -> dict:
    if not u:
        return u
    return {
        "id": u.get("id"),
        "name": u.get("name"),
        "phone": u.get("phone"),
        "role": u.get("role"),
        "city": u.get("city"),
        "kyc_status": u.get("kyc_status"),
        "credit_limit": u.get("credit_limit"),
        "shop_name": u.get("shop_name"),
        "brand_name": u.get("brand_name"),
        "product_category": u.get("product_category"),
        "created_at": u.get("created_at"),
    }


async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    role = payload.get("role")
    uid = int(payload.get("sub"))
    if role == "admin" and uid == 0:
        return {
            "id": 0,
            "name": "Admin",
            "phone": ADMIN_PHONE,
            "role": "admin",
            "kyc_status": "verified",
        }
    u = await db.users.find_one({"id": uid})
    if not u:
        raise HTTPException(status_code=401, detail="User not found")
    return u


def require_role(*roles):
    async def inner(user: dict = Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return inner


# ---------------------------------------------------------------------------
# App / Router
# ---------------------------------------------------------------------------
app = FastAPI(title="FERI Wholesale API")
api = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@api.get("/health")
async def health():
    return {"status": "ok"}


# ---------------- AUTH ----------------
@api.post("/auth/login")
async def login(body: LoginInput):
    # Admin shortcut
    if body.role == "admin":
        if body.phone == ADMIN_PHONE and body.password == ADMIN_PASSWORD:
            tok = create_token(0, "admin", body.phone)
            return {
                "token": tok,
                "user": {
                    "id": 0,
                    "name": "Admin",
                    "phone": body.phone,
                    "role": "admin",
                    "kyc_status": "verified",
                },
            }
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    u = await db.users.find_one({"phone": body.phone, "role": body.role})
    if not u:
        raise HTTPException(status_code=401, detail="No account with that phone & role")
    if not verify_password(body.password, u["password_hash"]):
        raise HTTPException(status_code=401, detail="Wrong password")

    tok = create_token(u["id"], u["role"], u["phone"])
    return {"token": tok, "user": user_to_public(u)}


@api.post("/auth/register-retailer")
async def register_retailer(body: RetailerRegisterInput):
    existing = await db.users.find_one({"phone": body.phone, "role": "retailer"})
    if existing:
        raise HTTPException(status_code=409, detail="Phone already registered as retailer")
    uid = await next_id("users")
    doc = {
        "id": uid,
        "name": body.owner_name,
        "phone": body.phone,
        "role": "retailer",
        "city": body.city,
        "shop_name": body.shop_name,
        "kyc_status": "pending",
        "credit_limit": 50000.0,
        "password_hash": hash_password(body.password),
        "created_at": now_iso(),
    }
    await db.users.insert_one(doc)
    tok = create_token(uid, "retailer", body.phone)
    return {"token": tok, "user": user_to_public(doc)}


@api.post("/auth/register-brand")
async def register_brand(body: BrandRegisterInput):
    existing = await db.users.find_one({"phone": body.phone, "role": "brand"})
    if existing:
        raise HTTPException(status_code=409, detail="Phone already registered as brand")
    uid = await next_id("users")
    doc = {
        "id": uid,
        "name": body.contact_person,
        "phone": body.phone,
        "role": "brand",
        "brand_name": body.brand_name,
        "product_category": body.product_category,
        "kyc_status": "verified",
        "password_hash": hash_password(body.password),
        "created_at": now_iso(),
    }
    await db.users.insert_one(doc)
    tok = create_token(uid, "brand", body.phone)
    return {"token": tok, "user": user_to_public(doc)}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user_to_public(user)


# ---------------- PRODUCTS ----------------
def product_to_public(p: dict) -> dict:
    return {
        "id": p["id"],
        "name": p["name"],
        "category": p["category"],
        "mrp": float(p["mrp"]),
        "wholesale_price": float(p["wholesale_price"]),
        "margin_percent": float(p.get("margin_percent") or round((p["mrp"] - p["wholesale_price"]) / p["mrp"] * 100, 1)),
        "brand_id": p.get("brand_id"),
        "brand_name": p.get("brand_name"),
        "exchange_eligible": bool(p.get("exchange_eligible", False)),
        "stock_status": p.get("stock_status", "in_stock"),
        "moq": int(p.get("moq", 1)),
        "description": p.get("description"),
        "image_url": p.get("image_url"),
        "is_approved": bool(p.get("is_approved", True)),
        "created_at": p.get("created_at"),
        "is_featured": bool(p.get("is_featured", False)),
    }


@api.get("/products")
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = "popular",
    brand_id: Optional[int] = None,
):
    q: dict = {"is_approved": True}
    if category:
        q["category"] = category
    if brand_id:
        q["brand_id"] = brand_id
    if search:
        q["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"brand_name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]

    sort_spec = [("popularity", -1), ("id", 1)]
    if sort == "new":
        sort_spec = [("id", -1)]
    elif sort == "price_asc":
        sort_spec = [("wholesale_price", 1)]
    elif sort == "margin_desc":
        sort_spec = [("margin_percent", -1)]

    cursor = db.products.find(q).sort(sort_spec).limit(200)
    return [product_to_public(p) async for p in cursor]


@api.get("/products/featured")
async def featured_products():
    cursor = db.products.find({"is_approved": True, "is_featured": True}).sort([("popularity", -1)]).limit(8)
    rows = [product_to_public(p) async for p in cursor]
    if len(rows) < 6:
        # backfill with top products
        extra_cursor = db.products.find({"is_approved": True}).sort([("popularity", -1)]).limit(8 - len(rows))
        seen = {r["id"] for r in rows}
        async for p in extra_cursor:
            if p["id"] in seen:
                continue
            rows.append(product_to_public(p))
    return rows


@api.get("/products/{product_id}")
async def get_product(product_id: int):
    p = await db.products.find_one({"id": product_id})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_public(p)


@api.post("/products")
async def create_product(body: ProductInput, user=Depends(require_role("brand", "admin"))):
    pid = await next_id("products")
    margin = round((body.mrp - body.wholesale_price) / body.mrp * 100, 1) if body.mrp > 0 else 0
    doc = {
        "id": pid,
        "name": body.name,
        "category": body.category,
        "mrp": body.mrp,
        "wholesale_price": body.wholesale_price,
        "margin_percent": margin,
        "moq": body.moq,
        "description": body.description,
        "image_url": body.image_url,
        "exchange_eligible": body.exchange_eligible,
        "stock_status": "in_stock",
        "is_approved": True,
        "is_featured": False,
        "popularity": 0,
        "created_at": now_iso(),
    }
    if user.get("role") == "brand":
        doc["brand_id"] = user["id"]
        doc["brand_name"] = user.get("brand_name")
    await db.products.insert_one(doc)
    return product_to_public(doc)


@api.get("/brand/products")
async def brand_products(user=Depends(require_role("brand"))):
    cursor = db.products.find({"brand_id": user["id"]}).sort([("id", -1)])
    return [product_to_public(p) async for p in cursor]


# ---------------- ORDERS ----------------
def order_to_public(o: dict) -> dict:
    return {
        "id": o["id"],
        "retailer_id": o["retailer_id"],
        "retailer_name": o.get("retailer_name"),
        "retailer_city": o.get("retailer_city"),
        "items": o.get("items", []),
        "total_amount": float(o["total_amount"]),
        "payment_type": o["payment_type"],
        "status": o["status"],
        "delivery_date": o.get("delivery_date"),
        "created_at": o.get("created_at"),
    }


@api.post("/orders")
async def create_order(body: OrderInput, user=Depends(require_role("retailer"))):
    if not body.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    pids = [i.product_id for i in body.items]
    products = {p["id"]: p async for p in db.products.find({"id": {"$in": pids}})}
    items = []
    total = 0.0
    for it in body.items:
        p = products.get(it.product_id)
        if not p:
            raise HTTPException(status_code=400, detail=f"Product {it.product_id} not found")
        unit = float(p["wholesale_price"])
        items.append({
            "product_id": p["id"],
            "product_name": p["name"],
            "quantity": it.quantity,
            "unit_price": unit,
        })
        total += unit * it.quantity

    # Credit check for net_* payments
    if body.payment_type != "pay_now":
        credit = await db.credits.find_one({"retailer_id": user["id"]}) or {}
        used = float(credit.get("used_amount", 0))
        limit = float(credit.get("credit_limit", user.get("credit_limit") or 50000))
        if used + total > limit:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient credit. Available: ₹{limit - used:.0f}",
            )

    oid = await next_id("orders")
    doc = {
        "id": oid,
        "retailer_id": user["id"],
        "retailer_name": user.get("shop_name") or user.get("name"),
        "retailer_city": user.get("city"),
        "items": items,
        "total_amount": total,
        "payment_type": body.payment_type,
        "status": "pending",
        "delivery_date": None,
        "created_at": now_iso(),
    }
    await db.orders.insert_one(doc)

    # If credit-based, add a credit entry
    if body.payment_type != "pay_now":
        days_map = {"net_15": 15, "net_30": 30, "net_60": 60}
        days = days_map.get(body.payment_type, 30)
        cid = await next_id("credit_entries")
        await db.credit_entries.insert_one({
            "id": cid,
            "retailer_id": user["id"],
            "order_id": oid,
            "amount": total,
            "due_date": (datetime.now(timezone.utc) + timedelta(days=days)).isoformat(),
            "status": "pending",
            "created_at": now_iso(),
        })
        await db.credits.update_one(
            {"retailer_id": user["id"]},
            {
                "$inc": {"used_amount": total},
                "$setOnInsert": {
                    "credit_limit": float(user.get("credit_limit") or 50000),
                },
            },
            upsert=True,
        )

    # Bump product popularity
    await db.products.update_many({"id": {"$in": pids}}, {"$inc": {"popularity": 1}})

    return order_to_public(doc)


@api.get("/orders")
async def list_my_orders(user=Depends(require_role("retailer", "brand"))):
    if user.get("role") == "retailer":
        q = {"retailer_id": user["id"]}
        cursor = db.orders.find(q).sort([("id", -1)])
        return [order_to_public(o) async for o in cursor]
    # brand: orders containing the brand's products
    brand_pids = [p["id"] async for p in db.products.find({"brand_id": user["id"]}, {"id": 1})]
    cursor = db.orders.find({"items.product_id": {"$in": brand_pids}}).sort([("id", -1)])
    return [order_to_public(o) async for o in cursor]


@api.get("/orders/recent")
async def recent_orders(user=Depends(require_role("retailer"))):
    cursor = db.orders.find({"retailer_id": user["id"]}).sort([("id", -1)]).limit(5)
    return [order_to_public(o) async for o in cursor]


@api.patch("/orders/{order_id}/status")
async def update_order_status(order_id: int, body: OrderStatusUpdate, user=Depends(require_role("brand", "admin"))):
    o = await db.orders.find_one({"id": order_id})
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    upd = {"status": body.status}
    if body.delivery_date:
        upd["delivery_date"] = body.delivery_date
    await db.orders.update_one({"id": order_id}, {"$set": upd})
    o2 = await db.orders.find_one({"id": order_id})
    return order_to_public(o2)


# ---------------- RETAILER SUMMARY / CREDIT ----------------
@api.get("/retailer/summary")
async def retailer_summary(user=Depends(require_role("retailer"))):
    total_orders = await db.orders.count_documents({"retailer_id": user["id"]})
    pending = await db.orders.count_documents({
        "retailer_id": user["id"],
        "status": {"$in": ["pending", "confirmed", "dispatched"]},
    })
    credit = await db.credits.find_one({"retailer_id": user["id"]}) or {}
    limit = float(credit.get("credit_limit", user.get("credit_limit") or 50000))
    used = float(credit.get("used_amount", 0))
    return {
        "total_orders": total_orders,
        "pending_deliveries": pending,
        "available_credit": max(0, limit - used),
    }


@api.get("/retailer/credit")
async def get_credit(user=Depends(require_role("retailer"))):
    credit = await db.credits.find_one({"retailer_id": user["id"]}) or {}
    limit = float(credit.get("credit_limit", user.get("credit_limit") or 50000))
    used = float(credit.get("used_amount", 0))
    entries = []
    async for e in db.credit_entries.find({"retailer_id": user["id"]}).sort([("id", -1)]):
        entries.append({
            "id": e["id"],
            "amount": float(e["amount"]),
            "due_date": e["due_date"],
            "status": e["status"],
            "order_id": e.get("order_id"),
            "created_at": e.get("created_at"),
        })
    return {
        "retailer_id": user["id"],
        "credit_limit": limit,
        "used_amount": used,
        "available_limit": max(0, limit - used),
        "entries": entries,
    }


# ---------------- BRAND SUMMARY ----------------
@api.get("/brand/summary")
async def brand_summary(user=Depends(require_role("brand"))):
    total_products = await db.products.count_documents({"brand_id": user["id"]})
    brand_pids = [p["id"] async for p in db.products.find({"brand_id": user["id"]}, {"id": 1})]
    total_orders = await db.orders.count_documents({"items.product_id": {"$in": brand_pids}})
    # revenue this month (calendar month)
    start_of_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    revenue = 0.0
    async for o in db.orders.find({"items.product_id": {"$in": brand_pids}, "created_at": {"$gte": start_of_month.isoformat()}}):
        for it in o.get("items", []):
            if it["product_id"] in brand_pids:
                revenue += it["unit_price"] * it["quantity"]
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "revenue_this_month": revenue,
        "top_selling_product": None,
    }


# ---------------- ADMIN ----------------
@api.get("/admin/summary")
async def admin_summary(user=Depends(require_role("admin"))):
    total_retailers = await db.users.count_documents({"role": "retailer"})
    today_iso = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    orders_today = await db.orders.count_documents({"created_at": {"$gte": today_iso}})
    revenue_today = 0.0
    async for o in db.orders.find({"created_at": {"$gte": today_iso}}):
        revenue_today += float(o.get("total_amount", 0))
    active_credits = await db.credit_entries.count_documents({"status": "pending"})
    return {
        "total_retailers": total_retailers,
        "orders_today": orders_today,
        "revenue_today": revenue_today,
        "active_credits": active_credits,
        "pending_exchanges": 0,
        "new_registrations": await db.users.count_documents({"created_at": {"$gte": today_iso}}),
    }


@api.get("/admin/retailers")
async def admin_retailers(user=Depends(require_role("admin"))):
    out = []
    async for u in db.users.find({"role": "retailer"}).sort([("id", -1)]):
        credit = await db.credits.find_one({"retailer_id": u["id"]}) or {}
        out.append({
            **user_to_public(u),
            "available_limit": float(credit.get("credit_limit", u.get("credit_limit") or 50000)) - float(credit.get("used_amount", 0)),
            "used_amount": float(credit.get("used_amount", 0)),
        })
    return out


@api.patch("/admin/retailers/{user_id}/kyc")
async def update_kyc(user_id: int, body: KycUpdate, user=Depends(require_role("admin"))):
    res = await db.users.update_one({"id": user_id}, {"$set": {"kyc_status": body.kyc_status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Retailer not found")
    return {"success": True}


@api.patch("/admin/retailers/{user_id}/credit-limit")
async def update_credit_limit(user_id: int, body: CreditLimitUpdate, user=Depends(require_role("admin"))):
    res = await db.users.update_one({"id": user_id}, {"$set": {"credit_limit": body.credit_limit}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Retailer not found")
    await db.credits.update_one(
        {"retailer_id": user_id},
        {"$set": {"credit_limit": body.credit_limit}},
        upsert=True,
    )
    return {"success": True}


@api.get("/admin/orders")
async def admin_orders(user=Depends(require_role("admin"))):
    cursor = db.orders.find().sort([("id", -1)]).limit(500)
    return [order_to_public(o) async for o in cursor]


# ---------------------------------------------------------------------------
# Mount router + CORS
# ---------------------------------------------------------------------------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup: indexes + seed
# ---------------------------------------------------------------------------
async def ensure_indexes():
    await db.users.create_index([("phone", 1), ("role", 1)], unique=True)
    await db.users.create_index("id", unique=True)
    await db.products.create_index("id", unique=True)
    await db.products.create_index("category")
    await db.orders.create_index("id", unique=True)
    await db.orders.create_index("retailer_id")
    await db.credits.create_index("retailer_id", unique=True)
    await db.credit_entries.create_index("retailer_id")


async def seed_users():
    for u in SEED_USERS:
        existing = await db.users.find_one({"phone": u["phone"], "role": u["role"]})
        if existing:
            # ensure password is up to date
            if not verify_password(u["password"], existing.get("password_hash", "")):
                await db.users.update_one(
                    {"_id": existing["_id"]},
                    {"$set": {"password_hash": hash_password(u["password"])}},
                )
            continue
        uid = await next_id("users")
        doc = {k: v for k, v in u.items() if k != "password"}
        doc["id"] = uid
        doc["password_hash"] = hash_password(u["password"])
        doc["created_at"] = now_iso()
        await db.users.insert_one(doc)


async def seed_products():
    if await db.products.count_documents({}) > 0:
        return
    # Map brand_name → brand_id
    brand_map = {}
    async for b in db.users.find({"role": "brand"}):
        brand_map[b["brand_name"]] = b["id"]

    for p in SEED_PRODUCTS:
        pid = await next_id("products")
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


async def seed_sample_orders():
    if await db.orders.count_documents({}) > 0:
        return
    retailers = {u["phone"]: u async for u in db.users.find({"role": "retailer"})}
    for spec in SEED_ORDERS_SPEC:
        retailer = retailers.get(spec["retailer_phone"])
        if not retailer:
            continue
        product_names = spec["products"]
        items = []
        total = 0.0
        for pname, qty in product_names:
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
        oid = await next_id("orders")
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

        # credit entry if applicable
        if spec.get("payment_type", "net_30") != "pay_now":
            days_map = {"net_15": 15, "net_30": 30, "net_60": 60}
            days = days_map.get(spec.get("payment_type", "net_30"), 30)
            cid = await next_id("credit_entries")
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
                        "$setOnInsert": {
                            "credit_limit": float(retailer.get("credit_limit") or 50000),
                        },
                    },
                    upsert=True,
                )


@app.on_event("startup")
async def on_startup():
    logger.info("Ensuring indexes & seeding…")
    await ensure_indexes()
    await seed_users()
    await seed_products()
    await seed_sample_orders()
    logger.info("Startup complete.")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
