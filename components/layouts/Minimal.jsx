import Watermark from "../Watermark";

export default function Minimal({ invoice, myInfo, isPro, total, formatMoney }) {
  const currency = myInfo.currency || "EUR";
  return (
    <div className="print-area bg-white max-w-2xl mx-auto p-12" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
      <div className="flex justify-between items-baseline mb-12 pb-4 border-b border-stone-900">
        <div>
          {myInfo.logo ? <img src={myInfo.logo} alt="Logo" className="h-10 mb-4 object-contain" /> : null}
          <h1 className="text-xl font-normal tracking-widest uppercase">Facture {invoice.number}</h1>
        </div>
        <p className="text-sm text-stone-500">{invoice.date}</p>
      </div>

      <div className="grid grid-cols-2 gap-10 mb-12 text-sm">
        <div>
          <p className="text-stone-400 text-xs tracking-widest uppercase mb-2">De</p>
          <p className="font-medium">{myInfo.name || "Votre entreprise"}</p>
          <p className="text-stone-600 whitespace-pre-line">{myInfo.address}</p>
          {myInfo.siret && <p className="text-stone-600">SIRET: {myInfo.siret}</p>}
        </div>
        <div>
          <p className="text-stone-400 text-xs tracking-widest uppercase mb-2">Pour</p>
          <p className="font-medium">{invoice.clientName}</p>
          <p className="text-stone-600 whitespace-pre-line">{invoice.clientAddress}</p>
          {invoice.dueDate && <p className="text-stone-600 mt-2">Échéance: {invoice.dueDate}</p>}
        </div>
      </div>

      <table className="w-full text-sm mb-8">
        <thead>
          <tr className="text-stone-400 text-xs tracking-widest uppercase">
            <th className="text-left pb-3 font-normal">Description</th>
            <th className="text-right pb-3 font-normal">Qté</th>
            <th className="text-right pb-3 font-normal">Prix</th>
            <th className="text-right pb-3 font-normal">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it) => (
            <tr key={it.id}>
              <td className="py-2 border-t border-stone-100">{it.label}</td>
              <td className="text-right py-2 border-t border-stone-100">{it.qty}</td>
              <td className="text-right py-2 border-t border-stone-100">{formatMoney(it.price, currency)}</td>
              <td className="text-right py-2 border-t border-stone-100">{formatMoney(it.qty * it.price, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-48 flex justify-between text-base pt-3 border-t-2 border-stone-900">
          <span className="tracking-widest uppercase text-sm">Total</span>
          <span className="font-medium">{formatMoney(total, currency)}</span>
        </div>
      </div>

      {invoice.notes && <p className="mt-12 text-xs text-stone-400">{invoice.notes}</p>}
      <Watermark isPro={isPro} />
    </div>
  );
}
