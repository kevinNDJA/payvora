import React from "react";
import LineItemsTable from "../LineItemsTable";
import Watermark from "../Watermark";

export default function Modern({ invoice, myInfo, isPro, accent, total, formatMoney }) {
  const currency = myInfo.currency || "EUR";
  return (
    <div className="print-area bg-white border border-stone-200 rounded-xl max-w-2xl mx-auto shadow-sm overflow-hidden">
      <div className="p-10 pb-8 text-white" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
        <div className="flex justify-between items-start">
          <div>
            {myInfo.logo ? (
              <img src={myInfo.logo} alt="Logo" className="h-12 mb-3 object-contain bg-white/90 rounded p-1" />
            ) : null}
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
              Facture
            </h1>
            <p className="text-sm opacity-80 mt-1 font-mono">{invoice.number}</p>
          </div>
          <div className="text-right text-sm opacity-90">
            <p className="font-semibold">{myInfo.name || "Votre entreprise"}</p>
            <p>{myInfo.address}</p>
            {myInfo.siret && <p>SIRET: {myInfo.siret}</p>}
          </div>
        </div>
      </div>

      <div className="p-10 pt-8">
        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <p className="uppercase text-xs tracking-wider mb-1 font-semibold" style={{ color: accent }}>
              Facturé à
            </p>
            <p className="font-semibold">{invoice.clientName}</p>
            <p className="text-stone-600 whitespace-pre-line">{invoice.clientAddress}</p>
          </div>
          <div className="text-right">
            <p className="uppercase text-xs tracking-wider mb-1 font-semibold" style={{ color: accent }}>
              Date
            </p>
            <p>{invoice.date}</p>
            {invoice.dueDate && (
              <>
                <p className="uppercase text-xs tracking-wider mt-2 mb-1 font-semibold" style={{ color: accent }}>
                  Échéance
                </p>
                <p>{invoice.dueDate}</p>
              </>
            )}
          </div>
        </div>

        <LineItemsTable invoice={invoice} total={total} accent={accent} currency={currency} headerClass="font-semibold" formatMoney={formatMoney} />

        {invoice.notes && (
          <div className="mt-8 pt-4 border-t border-stone-100 text-sm text-stone-500">
            <p>{invoice.notes}</p>
          </div>
        )}
        <Watermark isPro={isPro} />
      </div>
    </div>
  );
}
