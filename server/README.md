# Payvora server

Minimal Express server used to create Stripe Checkout sessions.

Setup:

1. Copy `.env.example` to `.env` and fill `STRIPE_SECRET_KEY` with your secret key (never commit `.env`).
2. Install dependencies:

```bash
cd server
npm install
```

3. Start the server:

```bash
npm start
```

The server listens on `PORT` (default `4242`) and exposes `POST /create-checkout-session` which returns `{ url }`.
