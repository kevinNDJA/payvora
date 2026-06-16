# Deployment guide

This document describes recommended deployment options for the Payvora project.

Frontend (recommended)
- Vercel: use the included GitHub Actions workflow to deploy on push to `main`, or run `vercel --prod` from `mon-application/`.
- Docker: build the frontend Docker image and serve with nginx:

```bash
# from repo root
docker build -t payvora-frontend ./mon-application
docker run -d -p 80:80 payvora-frontend
```

Backend (Express)
- Quick Docker deployment:

```bash
docker build -t payvora-server ./server
docker run -d -p 4242:4242 --env-file ./server/.env payvora-server
```

- Configure environment variables from `server/.env.example` (STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, etc.).

CI / GitHub
- The workflow `/.github/workflows/deploy-vercel.yml` builds the frontend and deploys to Vercel using secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

Stripe webhooks
- Register your webhook endpoint in Stripe to point to `https://<your-server>/webhook` and enable events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.

Notes
- For production, host the server on a reliable provider (Render, Fly.io, DigitalOcean, Heroku) and keep `SUPABASE_SERVICE_ROLE_KEY` secret. Configure HTTPS and set Stripe webhook secret.
