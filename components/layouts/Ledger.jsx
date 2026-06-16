import LineItemsTable from "../LineItemsTable";
import Watermark from "../Watermark";

export default function Ledger({ invoice, myInfo, isPro, accent, total, formatMoney }) {
  const currency = myInfo.currency || "EUR";
  return (
    <div className="print-area bg-white max-w-3xl mx-auto p-8 rounded shadow-sm font-mono">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-stone-400">{myInfo.name || "Votre entreprise"}</p>
          <p className="text-xs text-stone-500">{myInfo.address}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold">Facture</h2>
          <p className="text-xs text-stone-500">{invoice.number}</p>
        </div>
      </div>

      <LineItemsTable invoice={invoice} total={total} accent={accent} currency={currency} headerClass="text-stone-400" formatMoney={formatMoney} />

      {invoice.notes && <div className="mt-6 text-sm text-stone-500">{invoice.notes}</div>}
      <Watermark isPro={isPro} />
    </div>
  );
}
