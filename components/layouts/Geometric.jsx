import LineItemsTable from "../LineItemsTable";
import Watermark from "../Watermark";

export default function Geometric({ invoice, myInfo, isPro, accent, total, formatMoney }) {
  const currency = myInfo.currency || "EUR";
  return (
    <div className="print-area bg-white max-w-2xl mx-auto p-10 rounded-lg shadow-sm">
      <div className="grid grid-cols-3 gap-6 items-start mb-8">
        <div>
          {myInfo.logo ? <img src={myInfo.logo} alt="Logo" className="h-12 mb-3 object-contain" /> : null}
          <p className="text-sm font-semibold">{myInfo.name || "Votre entreprise"}</p>
          <p className="text-stone-600">{myInfo.address}</p>
        </div>
        <div className="col-span-2 text-right">
          <h1 className="text-3xl font-bold" style={{ color: accent }}>Facture</h1>
          <p className="text-sm text-stone-500">{invoice.number}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="rounded-lg p-4 grid grid-cols-2 gap-4" style={{ background: `${accent}10` }}>
          <div>
            <p className="text-xs text-stone-400 uppercase">Facturé à</p>
            <p className="font-semibold">{invoice.clientName}</p>
            <p className="text-stone-600 whitespace-pre-line">{invoice.clientAddress}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-400 uppercase">Date</p>
            <p>{invoice.date}</p>
          </div>
        </div>
      </div>

      <LineItemsTable invoice={invoice} total={total} accent={accent} currency={currency} headerClass="text-stone-400" formatMoney={formatMoney} />

      {invoice.notes && <div className="mt-6 text-sm text-stone-500">{invoice.notes}</div>}

      <Watermark isPro={isPro} />
    </div>
  );
}
