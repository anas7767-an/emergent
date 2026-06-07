"""Seed data for FERI Wholesale — users, brands, products, sample orders."""

# Bump this whenever the SEED_PRODUCTS list changes to trigger a re-seed.
SEED_VERSION = "2026-01-products-v2"

# ---------------------------------------------------------------------------
# USERS (4 retailers + 4 brands)  password=test123
# ---------------------------------------------------------------------------
SEED_USERS = [
    # Retailers
    {
        "name": "Ramesh Sharma",
        "phone": "9876543210",
        "role": "retailer",
        "city": "Nashik",
        "shop_name": "Sharma Kirana Store",
        "kyc_status": "verified",
        "credit_limit": 240000.0,
        "password": "test123",
    },
    {
        "name": "Abdul Karim",
        "phone": "9876543211",
        "role": "retailer",
        "city": "Malegaon",
        "shop_name": "Karim General Stores",
        "kyc_status": "verified",
        "credit_limit": 150000.0,
        "password": "test123",
    },
    {
        "name": "Priya Patil",
        "phone": "9876543212",
        "role": "retailer",
        "city": "Pune",
        "shop_name": "Patil Mart",
        "kyc_status": "pending",
        "credit_limit": 50000.0,
        "password": "test123",
    },
    {
        "name": "Suresh Yadav",
        "phone": "9876543213",
        "role": "retailer",
        "city": "Mumbai",
        "shop_name": "Yadav Provision Bhandar",
        "kyc_status": "verified",
        "credit_limit": 180000.0,
        "password": "test123",
    },
    # Brands
    {
        "name": "Mr. Rajesh Gupta",
        "phone": "9800000001",
        "role": "brand",
        "brand_name": "Raj Foods",
        "product_category": "FMCG",
        "kyc_status": "verified",
        "password": "test123",
    },
    {
        "name": "Mrs. Meena Joshi",
        "phone": "9800000002",
        "role": "brand",
        "brand_name": "Spice Garden",
        "product_category": "Spices",
        "kyc_status": "verified",
        "password": "test123",
    },
    {
        "name": "Mr. Anil Kapoor",
        "phone": "9800000003",
        "role": "brand",
        "brand_name": "SnackTime",
        "product_category": "Snacks",
        "kyc_status": "verified",
        "password": "test123",
    },
    {
        "name": "Mr. Vikram Desai",
        "phone": "9800000004",
        "role": "brand",
        "brand_name": "LocalBest",
        "product_category": "Local Products",
        "kyc_status": "verified",
        "password": "test123",
    },
]

# ---------------------------------------------------------------------------
# PRODUCTS — exact 10 SKUs as requested. No image_url — emoji rendered from
# `category` on the frontend.
# ---------------------------------------------------------------------------
def _p(name, category, mrp, wholesale, brand, moq, *, featured=False, exchange=False, desc=None, popularity=0):
    return {
        "name": name,
        "category": category,
        "mrp": float(mrp),
        "wholesale_price": float(wholesale),
        "brand_name": brand,
        "moq": moq,
        "image_url": None,
        "is_featured": featured,
        "exchange_eligible": exchange,
        "description": desc,
        "popularity": popularity,
    }


SEED_PRODUCTS = [
    _p("Kurkure Masala 26g",     "Snacks",    10,  7,   "SnackTime",    48, featured=True,  popularity=95),
    _p("Parle-G 200g",           "Biscuits",  30,  25,  "Raj Foods",    24, featured=True,  popularity=92),
    _p("Maggi Noodles 70g",      "Noodles",   14,  11,  "Raj Foods",    48, featured=True,  popularity=98),
    _p("Tata Salt 1kg",          "Staples",   22,  18,  "Raj Foods",    20, featured=False, popularity=80),
    _p("Surf Excel 200g",        "Detergent", 45,  36,  "Raj Foods",    24, featured=False, popularity=72),
    _p("Brooke Bond Tea 250g",   "Beverages", 130, 108, "Raj Foods",    12, featured=True,  popularity=78),
    _p("Hide & Seek 100g",       "Biscuits",  30,  22,  "SnackTime",    24, featured=False, popularity=82),
    _p("Hajmola 20s",            "Candy",     20,  15,  "SnackTime",    36, featured=False, popularity=68),
    _p("Feri Masala Mix 100g",   "Spices",    60,  35,  "Spice Garden", 12, featured=True,  popularity=88,
       exchange=True, desc="FERI's signature in-house masala blend — 60-day exchange guaranteed."),
    _p("Local Namkeen 200g",     "Snacks",    40,  25,  "LocalBest",    20, featured=False, popularity=70,
       exchange=True, desc="Hand-packed regional namkeen with a 60-day swap promise."),
]

# ---------------------------------------------------------------------------
# SAMPLE ORDERS (referenced by retailer phone + product name; idempotent)
# ---------------------------------------------------------------------------
SEED_ORDERS_SPEC = [
    {
        "retailer_phone": "9876543210",  # Ramesh Sharma
        "products": [
            ("Maggi Noodles 70g", 96),
            ("Parle-G 200g", 48),
            ("Tata Salt 1kg", 60),
        ],
        "payment_type": "net_30",
        "status": "delivered",
        "credit_status": "paid",
        "days_ago": 22,
    },
    {
        "retailer_phone": "9876543210",
        "products": [
            ("Kurkure Masala 26g", 144),
            ("Hide & Seek 100g", 48),
            ("Hajmola 20s", 72),
        ],
        "payment_type": "net_60",
        "status": "dispatched",
        "credit_status": "pending",
        "days_ago": 4,
    },
    {
        "retailer_phone": "9876543211",  # Abdul Karim
        "products": [
            ("Surf Excel 200g", 48),
            ("Brooke Bond Tea 250g", 24),
        ],
        "payment_type": "net_15",
        "status": "delivered",
        "credit_status": "paid",
        "days_ago": 10,
    },
    {
        "retailer_phone": "9876543213",  # Suresh Yadav
        "products": [
            ("Feri Masala Mix 100g", 24),
            ("Local Namkeen 200g", 40),
        ],
        "payment_type": "net_30",
        "status": "confirmed",
        "credit_status": "pending",
        "days_ago": 2,
    },
    {
        "retailer_phone": "9876543210",
        "products": [
            ("Brooke Bond Tea 250g", 12),
            ("Tata Salt 1kg", 40),
        ],
        "payment_type": "pay_now",
        "status": "delivered",
        "days_ago": 16,
    },
]
