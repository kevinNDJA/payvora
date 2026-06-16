import { Trash2 } from "lucide-react";
import Field from "./Field";

export default function EditView({ current, setCurrent, total, updateItem, addItem, removeItem, onCancel, onSave, myInfo, formatMoney, CURRENCIES = [] }) {
  const currency = myInfo.currency || "EUR";
  const currencySymbol = (CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0])?.label.match(/\((.+)\)/)?.[1] || currency;
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-5" style={{ fontFamily: "Georgia, serif" }}>
        Nouvelle facture
      </h1>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Numéro" value={current.number} onChange={(v) => setCurrent({ ...current, number: v })} />
        <Field
          label="Date"
          type="date"
          value={current.date}
          onChange={(v) => setCurrent({ ...current, date: v })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field
          label="Nom du client"
          value={current.clientName}
          onChange={(v) => setCurrent({ ...current, clientName: v })}
        />
        <Field
          label="Échéance"
          type="date"
          value={current.dueDate}
          onChange={(v) => setCurrent({ ...current, dueDate: v })}
        />
      </div>
      <Field
        label="Adresse du client"
        value={current.clientAddress}
        onChange={(v) => setCurrent({ ...current, clientAddress: v })}
      />

      <div className="mt-5">
        <span className="text-xs font-medium text-stone-500">Prestations</span>
        <div className="mt-2 space-y-2">
          {current.items.map((it) => (
            <div key={it.id} className="flex gap-2 items-center">
              <input
                placeholder="Description"
                value={it.label}
                onChange={(e) => updateItem(it.id, "label", e.target.value)}
                className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="number"
                placeholder="Qté"
                value={it.qty}
                onChange={(e) => updateItem(it.id, "qty", Number(e.target.value))}
                className="w-20 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="number"
                placeholder={`Prix ${currencySymbol}`}
                value={it.price}
                onChange={(e) => updateItem(it.id, "price", Number(e.target.value))}
                className="w-24 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button onClick={() => removeItem(it.id)} className="text-stone-300 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-2 text-xs text-amber-700 font-medium hover:underline">
          + Ajouter une ligne
        </button>
      </div>

      <div className="mt-4">
        <Field label="Notes" value={current.notes} onChange={(v) => setCurrent({ ...current, notes: v })} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4">
        <span className="text-sm text-stone-500">Total</span>
        <span className="text-xl font-bold font-mono">{formatMoney(total, currency)}</span>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-stone-300">
          Annuler
        </button>
        <button onClick={onSave} className="px-4 py-2 text-sm rounded-lg bg-stone-900 text-white">
          Enregistrer et prévisualiser
        </button>
      </div>
    </div>
  );
}
