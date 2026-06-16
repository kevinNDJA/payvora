import React from "react";

export default function LineItemsTable({ invoice, total, accent, currency, headerClass = "", bodyClass = "", formatMoney }) {
  const fmt = formatMoney || ((n) => (n || 0).toLocaleString(undefined, { style: "currency", currency }));
  return (
    <>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className={`border-b text-xs uppercase tracking-wider ${headerClass}`} style={{ borderColor: accent + "33" }}>
            <th className="text-left pb-2">Description</th>
            <th className="text-right pb-2">Qté</th>
            <th className="text-right pb-2">Prix unitaire</th>
            <th className="text-right pb-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it) => (
            <tr key={it.id} className={`border-b border-stone-100 ${bodyClass}`}>
              <td className="py-2">{it.label}</td>
              <td className="text-right py-2">{it.qty}</td>
              <td className="text-right py-2">{fmt(it.price, currency)}</td>
              <td className="text-right py-2 font-medium">{fmt(it.qty * it.price, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end">
        <div className="w-48">
          <div className="flex justify-between text-lg font-bold border-t pt-2" style={{ borderColor: accent }}>
            <span>Total</span>
            <span className="font-mono">{fmt(total, currency)}</span>
          </div>
        </div>
      </div>
    </>
  );
}
