# FERI Wholesale — PRD

## Original Problem Statement
> "ye jo mai ye mera startup hai to isme teri help hona bnane me"
> (Hindi/Hinglish: This is my startup, please help me build it.)

FERI Wholesale — India's B2B platform connecting kirana retailers with FMCG brands (instant credit, direct ordering, 60-day exchange).

## User Decisions
- Phase 1: Landing page redesign — white/cream theme with navy + gold accents.
- Phase 2: Add features — expand product catalog & cart; redesign auth + retailer dashboard.
- Backend: FastAPI + MongoDB (chosen by user — Option A).
- Phase 3: Product catalog locked to exactly 10 SKUs (user-specified); switched from photos to category emoji tiles on navy/grey backgrounds; green margin badges + gold exchange badges.

## Architecture
- **Frontend**: React 19 + Vite 7 + Tailwind 4 + shadcn/ui + Wouter + TanStack Query + Framer Motion at `/app/frontend` (port 3000 via supervisor `yarn start`).
- **Backend**: FastAPI + motor + bcrypt + PyJWT at `/app/backend` (port 8001 via supervisor uvicorn). MongoDB at `mongodb://localhost:27017` db=`feri_wholesale`.
- API base: same-origin `/api` (routed via Kubernetes ingress).
- Hand-written API client at `/app/frontend/src/lib/api/index.ts` (replaces orval-generated client).

## User Personas
1. Kirana Retailer — small Indian retail shop owner.
2. FMCG / Local Brand — manufacturer wanting distribution without sales team.
3. Admin — FERI operator approving KYC, managing credit, monitoring orders.

## Core Requirements
- Role-based auth: retailer / brand / admin (JWT Bearer).
- Curated wholesale product catalog with cart & checkout.
- Order management with Net-15/30/60 credit terms.
- 60-day product exchange flow.
- Landing page + dashboards for each role.

## What's Been Implemented

### Phase 1 — Landing page redesign (✅)
- Light theme with navy `#003087` + gold `#FFD700` + saffron `#FF9933` accents.
- Bricolage Grotesque + Plus Jakarta Sans typography.
- Hero w/ floating credit/order badges, brand marquee, stats strip, How-it-works (3 steps), bento features grid, "For Brands" CTA, footer.

### Phase 2 — Backend + Auth + Retailer dashboard (✅, validated by testing subagent: 25/25 backend tests, full frontend e2e passing)
- FastAPI backend at `/app/backend/server.py`:
  - POST /api/auth/login (role-aware)
  - POST /api/auth/register-retailer, /register-brand
  - GET /api/auth/me
  - GET/POST /api/products + /featured + /:id, GET /api/brand/products
  - POST /api/orders (with credit check + auto credit entry), GET /api/orders, /api/orders/recent, PATCH /api/orders/:id/status
  - GET /api/retailer/summary, /api/retailer/credit
  - GET /api/brand/summary
  - GET /api/admin/summary, /api/admin/retailers, PATCH kyc + credit-limit, GET /api/admin/orders
- Idempotent seed: 4 retailers + 4 brands + sample orders + credit entries.
- Admin hardcoded shortcut: `admin` / `feri@2025` (user_id=0).
- Frontend pages redesigned in light theme: `login`, `register-retailer`, `register-brand`, retailer `home`, `products`, `cart`, `orders`, `credit`, plus `retailer-layout` (sticky header + credit pill + bottom-tabs on mobile).

### Phase 3 — Catalog locked to user-specified 10 SKUs + emoji visuals (✅)
- Replaced 58-product catalog with exact 10 user-specified products:
  1. Kurkure Masala 26g — ₹10/₹7 — Snacks
  2. Parle-G 200g — ₹30/₹25 — Biscuits
  3. Maggi Noodles 70g — ₹14/₹11 — Noodles
  4. Tata Salt 1kg — ₹22/₹18 — Staples
  5. Surf Excel 200g — ₹45/₹36 — Detergent
  6. Brooke Bond Tea 250g — ₹130/₹108 — Beverages
  7. Hide & Seek 100g — ₹30/₹22 — Biscuits
  8. Hajmola 20s — ₹20/₹15 — Candy
  9. Feri Masala Mix 100g — ₹60/₹35 — Spices — Exchange eligible
  10. Local Namkeen 200g — ₹40/₹25 — Snacks — Exchange eligible
- Backend: added `SEED_VERSION` marker → forces clean re-seed of products/orders/credits when version bumps (no manual DB cleanup needed).
- Frontend: new `ProductTile` component (`/app/frontend/src/components/product-tile.tsx`) renders large category emoji on alternating navy `#003087` / light-grey `#f5f5f5` backgrounds; no `<img>` tags from random internet photos.
- Margin badge → green pill (`bg-emerald-100 text-emerald-700`).
- Exchange-eligible badge → gold pill (`bg-[#FFD700] text-[#003087]`).
- Category chips updated to: All / Snacks / Biscuits / Noodles / Staples / Detergent / Beverages / Candy / Spices.

## Prioritized Backlog

### P0
- (none — current iteration meets stated user requirements)

### P1
- Redesign auth pages were already done. Brand & admin dashboard pages still use the OLD dark theme — should be migrated to the new light theme to match the rest.
- Real "Request credit increase" backend endpoint (currently a stub returning success).
- Real exchange-request flow (currently button-only on net_60 delivered orders).

### P2 (future)
- Payment gateway (Razorpay).
- SMS / WhatsApp OTP login.
- GST invoice generation + PDF download.
- Delivery tracking with map + live ETA.
- Push notifications for order status.
- Hindi / Marathi UI.

## Test Credentials
See `/app/memory/test_credentials.md`.
