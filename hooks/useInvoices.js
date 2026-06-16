import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
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
      } catch (e) {}
      setLoading(false);
    })();
  }, [user]);

  const persistInvoices = async (next) => {
    setInvoices(next);
    try {
      if (user) {
        // naive approach: upsert each invoice (could be batched server-side)
        for (const inv of next) {
          // ensure user_id
          const payload = { ...inv, user_id: user.id };
          if (!inv.id || inv.id.startsWith('inv_')) {
            await invoiceService.createInvoice(payload);
          } else {
            await invoiceService.updateInvoice(inv.id, payload);
          }
        }
      } else {
        await window.storage.set("invoices", JSON.stringify(next));
      }
    } catch (e) {
      // ignore for now
    }
  };

  return { invoices, setInvoices, persistInvoices, loading };
}
