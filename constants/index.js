export const FREE_LIMIT = 3;
export const APP_NAME = "Payvora";

// Configuration Stripe — remplacez STRIPE_PAYMENT_LINK par votre lien de paiement réel
export const STRIPE_ACCOUNT_ID = "acct_1T2gGHB871Yhbvnc";
// Central Stripe constants
export const STRIPE_SUBSCRIPTION_URL = "https://buy.stripe.com/test_5kQdR8drW9gt4mM5Hv1ck00";
export const STRIPE_PUBLISHABLE_KEY = "pk_test_51T2gGHB87lYhbvncqUGSMWVCVyRhNcs8fpVnXjFPDWpy3g5CpXt6pnvO8okpARCzBfp2I47IGBokJbuJxIiCRidK00kJAvlzdX";
// Backwards-compatible alias used by older components
export const STRIPE_PAYMENT_LINK = STRIPE_SUBSCRIPTION_URL; // ex: "https://buy.stripe.com/xxxxxxxxxxxx"

export const CURRENCIES = [
  { code: "EUR", label: "Euro (€)", locale: "fr-FR" },
  { code: "USD", label: "Dollar US ($)", locale: "en-US" },
  { code: "GBP", label: "Livre sterling (£)", locale: "en-GB" },
  { code: "CHF", label: "Franc suisse (CHF)", locale: "fr-CH" },
  { code: "CAD", label: "Dollar canadien (CA$)", locale: "en-CA" },
  { code: "XOF", label: "Franc CFA (XOF)", locale: "fr-FR" },
  { code: "MAD", label: "Dirham marocain (MAD)", locale: "fr-MA" },
];

export const TEMPLATES = [
  { id: "classic", name: "Classique", pro: false, accent: "#1c1917" },
  { id: "modern", name: "Moderne", pro: true, accent: "#d97706" },
  { id: "minimal", name: "Minimal", pro: true, accent: "#0f172a" },
  { id: "bold", name: "Audacieux", pro: true, accent: "#7c3aed" },
  { id: "dark", name: "Sombre", pro: true, accent: "#22d3ee" },
  { id: "geometric", name: "Géométrique", pro: true, accent: "#dc2626" },
  { id: "elegant", name: "Élégant", pro: true, accent: "#b45309" },
  { id: "ledger", name: "Registre", pro: true, accent: "#15803d" },
];

export const ACCENT_COLORS = ["#d97706", "#0f172a", "#7c3aed", "#dc2626", "#0891b2", "#16a34a"];
