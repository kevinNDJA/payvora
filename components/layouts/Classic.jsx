import LineItemsTable from "../LineItemsTable";
import Watermark from "../Watermark";

export default function Classic({ invoice, myInfo, isPro, accent, total, formatMoney }) {
  const currency = myInfo.currency || "EUR";
  return (
    <div className="print-area bg-white border border-stone-200 rounded-xl p-10 max-w-2xl mx-auto shadow-sm">
      <div className="flex justify-between items-start mb-10">
        <div>
          {isPro && myInfo.logo ? <img src={myInfo.logo} alt="Logo" className="h-14 mb-3 object-contain" /> : null}
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
            Facture
          </h1>
          <p className="text-sm text-stone-500 mt-1 font-mono">{invoice.number}</p>
        </div>
        <div className="text-right text-sm text-stone-600">
          <p className="font-semibold">{myInfo.name || "Votre entreprise"}</p>
          <p>{myInfo.address}</p>
          {myInfo.siret && <p>SIRET: {myInfo.siret}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
        <div>
          <p className="text-stone-400 uppercase text-xs tracking-wider mb-1">Facturé à</p>
          <p className="font-semibold">{invoice.clientName}</p>
          <p className="text-stone-600 whitespace-pre-line">{invoice.clientAddress}</p>
        </div>
        <div className="text-right">
          <p className="text-stone-400 uppercase text-xs tracking-wider mb-1">Date</p>
          <p>{invoice.date}</p>
          {invoice.dueDate && (
            <>
              <p className="text-stone-400 uppercase text-xs tracking-wider mt-2 mb-1">Échéance</p>
              <p>{invoice.dueDate}</p>
            </>
          )}
        </div>
      </div>

      <LineItemsTable invoice={invoice} total={total} accent={accent} currency={currency} headerClass="text-stone-400 border-stone-200" formatMoney={formatMoney} />

      {invoice.notes && (
        <div className="mt-8 pt-4 border-t border-stone-100 text-sm text-stone-500">
          <p>{invoice.notes}</p>
        </div>
      )}
      <Watermark isPro={isPro} />
    </div>
  );
}
