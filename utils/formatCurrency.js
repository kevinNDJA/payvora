import { CURRENCIES } from "../constants";

export default function formatMoney(n, currency = "EUR") {
  const cur = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  return new Intl.NumberFormat(cur.locale, { style: "currency", currency: cur.code }).format(n || 0);
}
