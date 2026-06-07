# FERI Wholesale

India's B2B wholesale marketplace connecting **kirana retailers** directly with **FMCG brands** — with instant credit (up to 60 days), 60-day product exchange, and hassle-free delivery.

> Frontend: React 19 + Vite + Tailwind 4 + shadcn/ui
> Backend:  FastAPI + MongoDB (motor) + JWT auth
> Stack:    Type-safe end to end, fully responsive, light theme with navy + gold accents.

---

## ✨ Features

- **Retailer dashboard** — browse wholesale catalog, manage cart with MOQ enforcement, place orders with `pay_now` / `net_15` / `net_30` / `net_60` payment terms, track orders, monitor credit utilization & due dates.
- **Brand dashboard** — list products, view orders containing your SKUs, update fulfilment status.
- **Admin dashboard** — approve KYC, set per-retailer credit limits, view system-wide orders and revenue.
- **Auth** — phone + password, JWT Bearer tokens, role-aware login (retailer / brand / admin).
- **Hardcoded admin shortcut** — `admin` / `feri@2025` works out of the box (no DB row needed).
- **Idempotent seeding** — 4 retailers + 4 brands + 10 products + 5 sample orders auto-seed on first boot or via standalone `seed.py`.
- **Emoji product tiles** — clean category-emoji visuals on alternating navy/grey backgrounds (no random stock photos).

---

## 📁 Project structure

```
.
├── backend/                     # FastAPI + MongoDB API
│   ├── server.py                #   • all routes (auth, products, orders, credit, admin)
│   ├── seed_data.py             #   • SEED_USERS, SEED_PRODUCTS, SEED_ORDERS_SPEC
│   ├── seed.py                  #   • standalone seeding script (run manually)
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                    # React + Vite SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── landing.tsx                  # Public marketing page
│   │   │   ├── login.tsx                    # Role-aware login (retailer / brand / admin)
│   │   │   ├── register-retailer.tsx
│   │   │   ├── register-brand.tsx
│   │   │   ├── retailer/home.tsx
│   │   │   ├── retailer/products.tsx        # Wholesale catalog
│   │   │   ├── retailer/cart.tsx            # Cart + checkout
│   │   │   ├── retailer/orders.tsx
│   │   │   ├── retailer/credit.tsx          # Credit & dues
│   │   │   ├── brand/...                    # Brand dashboard
│   │   │   └── admin/...                    # Admin dashboard
│   │   ├── components/
│   │   │   ├── layout/{navbar,retailer-layout,brand-layout,admin-layout}.tsx
│   │   │   ├── product-tile.tsx             # Category-emoji product visual
│   │   │   └── ui/                          # shadcn/ui components
│   │   ├── contexts/cart-context.tsx        # localStorage-persisted cart
│   │   ├── hooks/use-auth.ts                # JWT in localStorage
│   │   ├── lib/api/index.ts                 # Hand-written API client + react-query hooks
│   │   ├── lib/product-visuals.ts           # Category → emoji + colour mapping
│   │   ├── App.tsx                          # Wouter routes + role guards
│   │   ├── main.tsx
│   │   └── index.css                        # Tailwind 4 + design tokens
│   ├── package.json
│   ├── vite.config.ts                       # Proxies /api → :8001 in dev
│   ├── tsconfig.json
│   ├── index.html
│   └── .env.example
│
├── memory/
│   ├── PRD.md                   # Full product spec
│   └── test_credentials.md      # Demo accounts (also listed below)
│
└── README.md (this file)
```

---

## 🚀 Quick start (local)

### Prerequisites

- **Node.js 20+** and **yarn**
- **Python 3.11+**
- **MongoDB 5+** running locally (or a free MongoDB Atlas cluster)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd <your-repo>
```

### 2. Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# OR: use a free Atlas cluster — copy your connection string to MONGO_URL below.
```

### 3. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt

cp .env.example .env
# Edit .env if you're not using the defaults (MONGO_URL, JWT_SECRET, etc.)

# Seed a fresh DB with admin, retailers, brands, products, sample orders:
python seed.py

# Start the API server
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

API will be live at **http://localhost:8001/api/health**

### 4. Frontend

In a new terminal:

```bash
cd frontend
yarn install
yarn start            # runs: vite --host 0.0.0.0 --port 3000
```

Open **http://localhost:3000** — the Vite dev server proxies `/api` → `http://localhost:8001`.

---

## 🔑 Demo credentials

| Role | Phone / Username | Password | Notes |
|------|------------------|----------|-------|
| Retailer | `9876543210` | `test123` | Ramesh Sharma — Sharma Kirana Store, Nashik (verified, ₹2,40,000 credit) |
| Retailer | `9876543211` | `test123` | Abdul Karim — Karim General Stores, Malegaon |
| Retailer | `9876543212` | `test123` | Priya Patil — Patil Mart, Pune (pending KYC) |
| Retailer | `9876543213` | `test123` | Suresh Yadav — Yadav Provision Bhandar, Mumbai |
| Brand | `9800000001` | `test123` | Raj Foods (FMCG) |
| Brand | `9800000002` | `test123` | Spice Garden (Spices) |
| Brand | `9800000003` | `test123` | SnackTime (Snacks) |
| Brand | `9800000004` | `test123` | LocalBest (Local Products) |
| **Admin** | **`admin`** | **`feri@2025`** | Hardcoded — no DB row, set in `.env` |

> ⚠️ Change `ADMIN_PASSWORD` and `JWT_SECRET` in `.env` before deploying to production.

---

## 📦 Seeded catalog (10 SKUs)

| # | Product | Category | MRP | Wholesale | Margin | Exchange |
|---|---------|----------|----:|----------:|-------:|:--------:|
| 1 | Kurkure Masala 26g | Snacks | ₹10 | ₹7 | 30% | — |
| 2 | Parle-G 200g | Biscuits | ₹30 | ₹25 | 16.7% | — |
| 3 | Maggi Noodles 70g | Noodles | ₹14 | ₹11 | 21.4% | — |
| 4 | Tata Salt 1kg | Staples | ₹22 | ₹18 | 18.2% | — |
| 5 | Surf Excel 200g | Detergent | ₹45 | ₹36 | 20% | — |
| 6 | Brooke Bond Tea 250g | Beverages | ₹130 | ₹108 | 16.9% | — |
| 7 | Hide & Seek 100g | Biscuits | ₹30 | ₹22 | 26.7% | — |
| 8 | Hajmola 20s | Candy | ₹20 | ₹15 | 25% | — |
| 9 | Feri Masala Mix 100g | Spices | ₹60 | ₹35 | 41.7% | ✅ |
| 10 | Local Namkeen 200g | Snacks | ₹40 | ₹25 | 37.5% | ✅ |

To change/add products, edit **`backend/seed_data.py`**, bump `SEED_VERSION`, and run `python seed.py --reset`.

---

## 🌐 API quick reference

Base: `http://localhost:8001/api`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| POST | `/auth/login` | — | `{phone, password, role}` → `{token, user}` |
| POST | `/auth/register-retailer` | — | Self-signup |
| POST | `/auth/register-brand` | — | Self-signup |
| GET | `/auth/me` | Bearer | Current user |
| GET | `/products` | — | `?category=&search=&sort=&brand_id=` |
| GET | `/products/featured` | — | Top 8 featured |
| GET | `/products/{id}` | — | Detail |
| POST | `/products` | Brand/Admin | Create new SKU |
| GET | `/brand/products` | Brand | Own catalogue |
| POST | `/orders` | Retailer | `{items, payment_type}` → checkout |
| GET | `/orders` | Retailer/Brand | Own orders |
| GET | `/orders/recent` | Retailer | Last 5 |
| PATCH | `/orders/{id}/status` | Brand/Admin | Update fulfilment |
| GET | `/retailer/summary` | Retailer | Totals + available credit |
| GET | `/retailer/credit` | Retailer | Credit + entries |
| GET | `/brand/summary` | Brand | Stats |
| GET | `/admin/summary` | Admin | Aggregates |
| GET | `/admin/retailers` | Admin | List w/ credit info |
| PATCH | `/admin/retailers/{id}/kyc` | Admin | Approve / reject KYC |
| PATCH | `/admin/retailers/{id}/credit-limit` | Admin | Adjust credit |
| GET | `/admin/orders` | Admin | All orders |

JWT is sent via `Authorization: Bearer <token>` and expires in 30 days.

---

## 🛠️ Development commands

```bash
# Backend
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
python seed.py                    # idempotent seeding
python seed.py --reset            # wipe + reseed (use with care)

# Frontend
cd frontend
yarn start                        # dev (vite, port 3000)
yarn build                        # production build → dist/
yarn serve                        # preview the production build
yarn typecheck                    # tsc --noEmit
```

---

## 🚢 Deployment notes

- **Backend** → any platform that supports Python ASGI (Render, Railway, Fly.io, AWS App Runner). Set the `.env` variables listed in `backend/.env.example`. Run `python seed.py` once after first deploy.
- **Frontend** → static-hosting friendly (`yarn build` produces `dist/`). On Vercel / Netlify / Cloudflare Pages set up a reverse proxy / redirect so that requests to `/api/*` are forwarded to your backend URL. Alternatively, set `VITE_API_BASE_URL=https://api.your-domain.com` in `frontend/.env` before building.
- **MongoDB** → MongoDB Atlas free tier works out of the box. Drop the `MONGO_URL` connection string into `backend/.env`.

---

## 🤝 Contributing

1. Fork & clone
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits (`feat:`, `fix:`, `refactor:`)
4. Push and open a PR

---

## 📜 License

Proprietary — © 2026 FERI Wholesale. All rights reserved.

---

## 📞 Contact

`anas983shaikh@gmail.com`
