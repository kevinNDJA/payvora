import { useState, useEffect } from "react";
import * as invoiceService from "../lib/services/invoiceService";
import useAuth from "./useAuth";

export default function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        if (user) {
          const { data, error } = await invoiceService.listInvoices({ userId: user.id });
          if (!error && data) setInvoices(data);
        } else {
          const inv = await window.storage.get("invoices");
          if (inv) setInvoices(JSON.parse(inv.value));
        }
      } catch {
        // keep local state usable when persistence is unavailable
      }
      setLoading(false);
    })();
  }, [user]);

  const persistInvoices = async (next) => {
    setInvoices(next);
    try {
      if (user) {
        // Determine which invoices changed vs the current state
        for (const inv of next) {
          const payload = { ...inv, user_id: user.id };
          // Local IDs start with 'inv_' — these are new invoices
          if (!inv.id || inv.id.startsWith("inv_")) {
            const { data } = await invoiceService.createInvoice(payload);
            // Replace temp id with real DB id in local state
            if (data?.[0]?.id) {
              setInvoices((prev) =>
                prev.map((i) => (i.id === inv.id ? { ...i, id: data[0].id } : i))
              );
            }
          } else {
            await invoiceService.updateInvoice(inv.id, payload);
          }
        }
      } else {
        await window.storage.set("invoices", JSON.stringify(next));
      }
    } catch {
      // ignore persistence errors silently
    }
  };

  return { invoices, setInvoices, persistInvoices, loading };
}
