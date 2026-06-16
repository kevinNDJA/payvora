const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const https = require('https');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // fallback to .env

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  }
}));

// Health check — used by Vercel / uptime monitors
app.get('/health', (_req, res) => res.json({ ok: true, service: 'payvora-server' }));

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY is not set. See server/.env.example');
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '', {
  httpClient: Stripe.createHttpClient({
    httpsAgent: new https.Agent({ keepAlive: true, ALPNProtocols: ['http/1.1'] }),
  }),
});

const supabase = require('./supabaseClient');

// POST /create-checkout-session
app.post('/create-checkout-session', express.json(), async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const userId = req.body?.user_id || null;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Payvora Pro' },
          unit_amount: 999,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      metadata: userId ? { supabase_user_id: String(userId) } : {},
      success_url: `${baseUrl}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/upgrade`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session error', err);
    res.status(500).json({ error: 'Failed to create Stripe Checkout session' });
  }
});

// POST /webhook — Stripe signature verified
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not set — skipping signature verification');
      event = JSON.parse(req.body.toString());
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const supabaseUserId = session.metadata?.supabase_user_id || null;
        const customerId = session.customer;
        if (supabaseUserId) {
          await supabase.from('profiles').update({ is_pro: true, stripe_customer_id: customerId }).eq('id', supabaseUserId);
        } else if (session.customer_details?.email) {
          await supabase.from('profiles').update({ is_pro: true, stripe_customer_id: customerId }).eq('email', session.customer_details.email);
        }
        break;
      }
      case 'invoice.payment_succeeded':
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const { data: profile } = await supabase.from('profiles').select('id').eq('stripe_customer_id', sub.customer).maybeSingle();
        if (profile) {
          await supabase.from('profiles').update({ is_pro: true, stripe_subscription_id: sub.id }).eq('id', profile.id);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const { data: profile } = await supabase.from('profiles').select('id').eq('stripe_customer_id', sub.customer).maybeSingle();
        if (profile) {
          await supabase.from('profiles').update({ is_pro: false, stripe_subscription_id: null }).eq('id', profile.id);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('Error handling webhook event:', err);
    // Respond 200 so Stripe does not retry for transient errors
  }

  res.json({ received: true });
});

// POST /migrate — import local data into Supabase on first login
app.post('/migrate', express.json(), async (req, res) => {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s*/i, '') || null;
    if (!token) return res.status(401).json({ error: 'Missing access token' });

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Invalid access token' });
    const userId = userData.user.id;

    const { invoices = [], settings = null } = req.body || {};
    const summary = { invoices: 0, clients: 0, items: 0 };

    const findOrCreateClient = async (client) => {
      if (!client) return null;
      try {
        if (client.email) {
          const { data: existing } = await supabase.from('clients').select('id').eq('user_id', userId).eq('email', client.email).maybeSingle();
          if (existing) return existing.id;
        }
        if (client.name) {
          const { data: existing } = await supabase.from('clients').select('id').eq('user_id', userId).eq('name', client.name).maybeSingle();
          if (existing) return existing.id;
        }
        const { data: created } = await supabase.from('clients').insert({
          user_id: userId,
          name: client.name || null,
          email: client.email || null,
          phone: client.phone || null,
          address: client.address || null,
          company: client.company || null,
        }).select().single();
        summary.clients += 1;
        return created?.id || null;
      } catch {
        return null;
      }
    };

    for (const inv of invoices) {
      try {
        const clientId = await findOrCreateClient(inv.client || inv.clientData || null);
        const { data: createdInv, error: createErr } = await supabase.from('invoices').insert({
          user_id: userId,
          invoice_number: inv.number || inv.invoice_number || null,
          client_id: clientId,
          issue_date: inv.date || inv.issue_date || null,
          due_date: inv.dueDate || inv.due_date || null,
          subtotal: inv.subtotal || inv.sub_total || 0,
          tax: inv.tax || 0,
          total: inv.total || 0,
          status: inv.status || 'draft',
          notes: inv.notes || null,
        }).select().single();
        if (createErr || !createdInv) continue;
        summary.invoices += 1;

        for (const it of (inv.items || inv.lines || [])) {
          try {
            const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
            const unit = Number(it.price ?? it.unit_price ?? 0) || 0;
            await supabase.from('invoice_items').insert({
              invoice_id: createdInv.id,
              user_id: userId,
              description: it.label || it.description || '',
              quantity: qty,
              unit_price: unit,
              total: Number(it.total ?? it.amount ?? qty * unit) || qty * unit,
            });
            summary.items += 1;
          } catch { /* continue */ }
        }
      } catch { /* continue */ }
    }

    if (settings) {
      try {
        await supabase.from('settings').upsert({
          id: userId,
          company_name: settings.name || settings.company_name || null,
          company_email: settings.email || settings.company_email || null,
          phone: settings.phone || null,
          address: settings.address || null,
          website: settings.website || null,
          currency: settings.currency || null,
          logo_url: settings.logo || settings.logo_url || null,
        });
      } catch { /* ignore */ }
    }

    return res.json({ ok: true, summary });
  } catch (err) {
    console.error('Migration error:', err);
    return res.status(500).json({ error: 'Migration failed' });
  }
});

const port = process.env.PORT || 4242;
app.listen(port, () => console.log(`Payvora server listening on port ${port}`));
