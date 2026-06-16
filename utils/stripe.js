import { STRIPE_SUBSCRIPTION_URL, STRIPE_PUBLISHABLE_KEY } from "../constants";
import supabase from "../lib/supabaseClient";

/**
 * Create a Checkout session by calling a backend endpoint.
 * Returns the session URL on success, or throws.
 */
export async function createCheckoutSession({ backendUrl } = {}) {
  const target = backendUrl || (typeof window !== "undefined" && window.__PAYVORA_BACKEND_URL) || "/create-checkout-session";
  try {
    // Attach logged-in Supabase user id when available so webhooks can link subscription
    let userId = null;
    try {
      const { data } = await supabase.auth.getSession?.();
      const session = data?.session ?? null;
      userId = session?.user?.id ?? null;
    } catch (e) {
      // ignore
    }

    const res = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error("Create session failed");
    const j = await res.json();
    return j.url;
  } catch (err) {
    console.warn("createCheckoutSession failed:", err);
    throw err;
  }
}

/**
 * Try backend Checkout first, fallback to the hosted Stripe subscription link.
 */
export async function openSubscription({ backendUrl } = {}) {
  if (typeof window === "undefined") return;
  try {
    const url = await createCheckoutSession({ backendUrl }).catch(() => null);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
  } catch (e) {
    // fallback below
  }
  window.open(STRIPE_SUBSCRIPTION_URL, "_blank", "noopener,noreferrer");
}

export { STRIPE_SUBSCRIPTION_URL, STRIPE_PUBLISHABLE_KEY };
