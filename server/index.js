const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY is not set. Create a .env file from .env.example');
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');
const supabase = require('./supabaseClient');

// Create a Checkout Session. Accepts optional `user_id` in the request body and stores it in session metadata
app.post('/create-checkout-session', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const userId = req.body?.user_id || null;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: 'Payvora Pro' },
            unit_amount: 999,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
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

// Stripe webhook handler — verify signature and update Supabase profiles accordingly
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    if (!webhookSecret) {
      // If no webhook secret configured, attempt to parse body without verification (warning)
      event = JSON.parse(req.body.toString());
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabase = require('./supabaseClient');

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const supabaseUserId = session.metadata?.supabase_user_id || null;
        const customerId = session.customer;
        // Mark profile as pro and store customer id
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
        const subscription = event.data.object;
        const customerId = subscription.customer;
        // Find profile by stripe_customer_id and update subscription id / is_pro
        const { data: profile } = await supabase.from('profiles').select('id').eq('stripe_customer_id', customerId).maybeSingle();
        if (profile) {
          await supabase.from('profiles').update({ is_pro: true, stripe_subscription_id: subscription.id }).eq('id', profile.id);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const { data: profile } = await supabase.from('profiles').select('id').eq('stripe_customer_id', customerId).maybeSingle();
        if (profile) {
          await supabase.from('profiles').update({ is_pro: false, stripe_subscription_id: null }).eq('id', profile.id);
        }
        break;
      }
      default:
        // console.log(`Unhandled event type ${event.type}`);
        break;
    }
  } catch (err) {
    console.error('Error handling webhook event', err);
    // Don't fail the webhook — respond 200 so Stripe won't retry endlessly for transient errors
  }

  res.json({ received: true });
});

// Migration endpoint: accepts user's local invoices/settings and imports them into Supabase.
// Requires Authorization: Bearer <access_token> header (Supabase access token).
app.post('/migrate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s*/i, '') || null;
    if (!token) return res.status(401).json({ error: 'Missing access token' });

    // verify token and get user
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Invalid access token' });
    const userId = userData.user.id;

    const { invoices = [], settings = null } = req.body || {};
    const summary = { invoices: 0, clients: 0, items: 0 };

    // Helper: find or create client
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
      } catch (e) {
        console.warn('findOrCreateClient error', e);
        return null;
      }
    };

    // Import invoices
    for (const inv of invoices || []) {
      try {
        const clientId = await findOrCreateClient(inv.client || inv.clientData || null);

        const invoicePayload = {
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
        };

        const { data: createdInv, error: createErr } = await supabase.from('invoices').insert(invoicePayload).select().single();
        if (createErr || !createdInv) continue;
        summary.invoices += 1;

        const items = inv.items || inv.lines || [];
        for (const it of items) {
          try {
            const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
            const unit = Number(it.price ?? it.unit_price ?? 0) || 0;
            const total = Number(it.total ?? it.amount ?? qty * unit) || qty * unit;
            await supabase.from('invoice_items').insert({
              invoice_id: createdInv.id,
              user_id: userId,
              description: it.label || it.description || '',
              quantity: qty,
              unit_price: unit,
              total,
            });
            summary.items += 1;
          } catch (e) {
            // continue
          }
        }
      } catch (e) {
        // continue
      }
    }

    // Upsert settings if provided
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
        }, { returning: 'minimal' });
      } catch (e) {
        // ignore
      }
    }

    return res.json({ ok: true, summary });
  } catch (err) {
    console.error('Migration error', err);
    return res.status(500).json({ error: 'Migration failed' });
  }
});

const port = process.env.PORT || 4242;
app.listen(port, () => console.log(`Payvora server listening on port ${port}`));
