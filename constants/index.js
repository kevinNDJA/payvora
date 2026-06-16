export const FREE_LIMIT = 3;
export const APP_NAME = "Payvora";

// Configure via environment variables — never hardcode real keys here
// VITE_STRIPE_PUBLISHABLE_KEY and VITE_STRIPE_PAYMENT_LINK in mon-application/.env.local
export const STRIPE_PUBLISHABLE_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY) || "";
export const STRIPE_SUBSCRIPTION_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PAYMENT_LINK) || "";
// Backwards-compatible alias
export const STRIPE_PAYMENT_LINK = STRIPE_SUBSCRIPTION_URL;

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
