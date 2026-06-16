import React from "react";
import LineItemsTable from "../LineItemsTable";
import Watermark from "../Watermark";

export default function Dark({ invoice, myInfo, isPro, accent, total, formatMoney }) {
  const currency = myInfo.currency || "EUR";
  return (
    <div
      className="print-area rounded-2xl max-w-2xl mx-auto shadow-sm p-10"
      style={{ backgroundColor: "#18181b", color: "#e7e5e4" }}
    >
      <div className="flex justify-between items-start mb-10">
        <div>
          {myInfo.logo ? (
            <img src={myInfo.logo} alt="Logo" className="h-12 mb-3 object-contain bg-white/95 rounded p-1" />
          ) : null}
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: accent, fontFamily: "Georgia, serif" }}>
            Facture
          </h1>
          <p className="text-sm mt-1 font-mono" style={{ color: "#a8a29e" }}>
            {invoice.number}
          </p>
        </div>
        <div className="text-right text-sm" style={{ color: "#d6d3d1" }}>
          <p className="font-semibold text-white">{myInfo.name || "Votre entreprise"}</p>
          <p>{myInfo.address}</p>
          {myInfo.siret && <p>SIRET: {myInfo.siret}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
        <div>
          <p className="uppercase text-xs tracking-wider mb-1" style={{ color: accent }}>
            Facturé à
          </p>
          <p className="font-semibold text-white">{invoice.clientName}</p>
          <p className="whitespace-pre-line" style={{ color: "#a8a29e" }}>
            {invoice.clientAddress}
          </p>
        </div>
        <div className="text-right">
          <p className="uppercase text-xs tracking-wider mb-1" style={{ color: accent }}>
            Date
          </p>
          <p>{invoice.date}</p>
          {invoice.dueDate && (
            <>
              <p className="uppercase text-xs tracking-wider mt-2 mb-1" style={{ color: accent }}>
                Échéance
              </p>
              <p>{invoice.dueDate}</p>
            </>
          )}
        </div>
      </div>

      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b text-xs uppercase tracking-wider" style={{ borderColor: "#3f3f46", color: "#a8a29e" }}>
            <th className="text-left pb-2">Description</th>
            <th className="text-right pb-2">Qté</th>
            <th className="text-right pb-2">Prix unitaire</th>
            <th className="text-right pb-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it) => (
            <tr key={it.id} className="border-b" style={{ borderColor: "#27272a" }}>
              <td className="py-2">{it.label}</td>
              <td className="text-right py-2">{it.qty}</td>
              <td className="text-right py-2">{formatMoney(it.price, currency)}</td>
              <td className="text-right py-2 font-medium">{formatMoney(it.qty * it.price, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-48">
          <div className="flex justify-between text-lg font-bold border-t pt-2" style={{ borderColor: accent, color: accent }}>
            <span>Total</span>
            <span className="font-mono">{formatMoney(total, currency)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-8 pt-4 border-t text-sm" style={{ borderColor: "#27272a", color: "#a8a29e" }}>
          <p>{invoice.notes}</p>
        </div>
      )}
      <Watermark isPro={isPro} dark />
    </div>
  );
}
