# Payvora (Facture Pro)

This workspace contains the Payvora invoicing front-end and supporting files.

Folders:

- `mon-application/` — React + Vite front-end. Run `npm install` then `npm run dev` or `npm run build`.

Server and integrations
- `server/` — minimal Express server to create Stripe Checkout sessions and handle Stripe webhooks. Configure `server/.env` from `server/.env.example` and run `npm install` then `npm run dev`.

Supabase
- The SQL to create the `profiles` table, enable Row Level Security and add a trigger to create a profile on signup is provided in `db/profiles.sql`. Apply it in your Supabase project's SQL editor.

Stripe
- Configure a webhook in the Stripe dashboard pointing to `https://<your-server>/webhook` and enable events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.

Environment
- Copy `server/.env.example` → `server/.env` and fill `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `FRONTEND_URL`.

Frontend env
- Copy `mon-application/.env.example` → `mon-application/.env` and fill `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and optionally `VITE_BACKEND_URL` (e.g. `http://localhost:4242`) so the frontend knows where to call the server for Checkout and migrations.

Migrating local pro flags
- The app will attempt to migrate a local `isPro` flag stored in `window.storage` into the signed-in user's `profiles.is_pro` when they sign in. There's also a migration helper at `lib/hooks/services/migratePro.js`.
 - When you sign in, the client will now attempt a one-time migration of your local invoices and settings into Supabase. The frontend calls the server `/migrate` endpoint with your Supabase access token to import `invoices`, `clients` and `settings` (logo upload is handled separately). The migration is idempotent and sets a `migrated_v1` flag in local storage to avoid repeating.

Creating a GitHub repo and deploying to Vercel (automated)
 - If you want me to create a GitHub repository for you automatically, set an environment variable `GITHUB_TOKEN` with a personal access token that has `repo` scope, then run:

```bash
# from the repository root
GITHUB_TOKEN=ghp_xxx node scripts/create_github_repo.js payvora
```

 - To deploy to Vercel from the local project via the CLI, install the Vercel CLI and log in, then run from `mon-application/`:

```bash
cd mon-application
vercel --prod
```

Notes: Both operations require authentication (GitHub or Vercel). For security, do NOT paste tokens into chat — use environment variables locally.

CI Deploy via GitHub Actions
- A GitHub Actions workflow `/.github/workflows/deploy-vercel.yml` is included and will run on pushes to `main`. To enable it you must add the following repository secrets in GitHub:
	- `VERCEL_TOKEN` — your Vercel token
	- `VERCEL_ORG_ID` — Vercel organization id (available from your Vercel project settings)
	- `VERCEL_PROJECT_ID` — Vercel project id (available from your Vercel project settings)

After creating the repository on GitHub and pushing, the workflow will build `mon-application` and deploy it to Vercel automatically when secrets are configured.


Branding: the app has been renamed to `Payvora`. Assets like `public/logo.png` are present for favicon and manifest.

---

## 📖 Documentation

- **[DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)** — Overall deployment status, next steps, and feature checklist
- **[GITHUB_UNBLOCK_INSTRUCTIONS.md](./GITHUB_UNBLOCK_INSTRUCTIONS.md)** — ⚠️ **REQUIRED** — Instructions to unlock GitHub push protection (must be done before pushing code)
- **[SECURITY.md](./SECURITY.md)** — Security checklist and setup instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Production deployment guide (Docker, Vercel, Stripe webhooks)

## 🚀 Quick Start

### Local Development

```bash
# Frontend (Vite + React)
cd mon-application
npm install
npm run dev  # http://localhost:5173

# Backend (Express + Stripe webhooks)
cd server
npm install
npm run dev  # http://localhost:4242

# Build for production
npm run build
```

### GitHub & Deployment

1. **Before pushing to GitHub:** Follow [GITHUB_UNBLOCK_INSTRUCTIONS.md](./GITHUB_UNBLOCK_INSTRUCTIONS.md)
2. **Then push:** `git push -u origin main --force`
3. **After push:** GitHub Actions will auto-deploy to Vercel (once secrets are configured)

## ⚙️ Architecture

**Frontend (mon-application/):**
- React 18 + Vite
- Tailwind CSS
- Supabase Auth + Storage
- Services: invoiceService, settingsService, clientService
- Hooks: useAuth, useInvoices, useMyInfo, useProfile

**Backend (server/):**
- Express 4.18
- Stripe SDK (Checkout + webhooks)
- Supabase service role client
- Migration endpoint for local data import

**Database (Supabase):**
- PostgreSQL with RLS
- Tables: invoices, invoice_items, clients, profiles, settings
- Auto-migration on first login
