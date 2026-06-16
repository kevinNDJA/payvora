import LineItemsTable from "../LineItemsTable";
import Watermark from "../Watermark";

export default function Elegant({ invoice, myInfo, isPro, accent, total, formatMoney }) {
  const currency = myInfo.currency || "EUR";
  return (
    <div className="print-area bg-white max-w-2xl mx-auto p-12 rounded-xl shadow-md" style={{ fontFamily: "Georgia, serif" }}>
      <div className="flex justify-between items-start mb-8">
        <div>
          {myInfo.logo ? <img src={myInfo.logo} alt="Logo" className="h-14 mb-3 object-contain" /> : null}
          <h1 className="text-3xl font-semibold">Facture</h1>
          <p className="text-sm text-stone-500">{invoice.number}</p>
        </div>
        <div className="text-right text-sm text-stone-600">
          <p className="font-semibold">{myInfo.name || "Votre entreprise"}</p>
          <p>{myInfo.address}</p>
          {myInfo.siret && <p>SIRET: {myInfo.siret}</p>}
        </div>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-stone-400 text-xs uppercase">Facturé à</p>
            <p className="font-semibold">{invoice.clientName}</p>
            <p className="text-stone-600 whitespace-pre-line">{invoice.clientAddress}</p>
          </div>
          <div className="text-right">
            <p className="text-stone-400 text-xs uppercase">Date</p>
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
