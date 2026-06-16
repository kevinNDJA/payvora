# Security & Setup Checklist

## 🔐 Immediate Actions (CRITICAL)

1. **Rotate exposed Supabase keys immediately**
   - Go to Supabase Dashboard → Settings → API
   - Revoke any exposed keys from previous deployments
   - Generate new keys

2. **Environment variables are NOT committed to git**
   - `.env`, `server/.env`, `mon-application/.env` are in `.gitignore`
   - Only `.env.example` and `.env.local.example` are safe to commit

## 🛠️ Setup Steps

### Frontend Setup
```bash
cd mon-application

# Copy example to local (for development)
cp .env.example .env.local

# Edit .env.local with your actual Supabase keys:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=sb_publishable_...

npm install
npm run dev
```

### Backend Setup
```bash
cd server

# Copy example to local (for development)
cp .env.example .env.local

# Edit .env.local with:
# SUPABASE_URL=...
# SUPABASE_SERVICE_ROLE_KEY=... (keep this secret!)
# STRIPE_SECRET_KEY=... (from Stripe dashboard)
# STRIPE_WEBHOOK_SECRET=... (from Stripe dashboard)

npm install
npm run dev
```

### Supabase Configuration
1. Apply migrations:
   - SQL Editor → New query
   - Paste contents of `db/migration.sql`
   - Execute (creates tables, RLS, triggers)

2. Create `logos` bucket:
   - Storage → Buckets → New bucket
   - Name: `logos`
   - Public / Private per your policy
   - Add RLS policy if private

## 🚀 Deployment

### Vercel (Frontend)
- Push to GitHub
- Set repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- CI workflow triggers on push

### Docker (Backend)
```bash
docker build -t payvora-server ./server
docker run -d -p 4242:4242 --env-file ./server/.env payvora-server
```

### Stripe Webhooks
- Dashboard → Webhooks
- Endpoint: `https://<your-server>/webhook`
- Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
- Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## ✅ Verification Checklist
- [ ] Supabase keys rotated
- [ ] `.env` files created locally (not committed)
- [ ] Frontend build succeeds: `npm run build`
- [ ] Backend starts: `npm run dev`
- [ ] DB migrations applied in Supabase
- [ ] `logos` bucket created
- [ ] Stripe webhook registered
- [ ] GitHub push succeeds with auth
- [ ] Vercel deployment triggered (CI)
