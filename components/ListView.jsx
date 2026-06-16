import React, { useState } from "react";
import { Plus, Trash2, Users, FileText } from "lucide-react";

export default function ListView({ invoices, onNew, onOpen, onEdit, onDelete, myInfo, onUpdateInfo, isPro, onShowUpgrade, InfoModal, formatMoney }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif" }}>
            Vos factures
          </h1>
          <p className="text-sm text-stone-500 mt-1">Créez et gérez vos factures en quelques secondes.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-stone-300 hover:bg-stone-100 transition-colors"
          >
            <Users size={16} /> Mes infos
          </button>
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors"
          >
            <Plus size={16} /> Nouvelle facture
          </button>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="border border-dashed border-stone-300 rounded-xl py-16 text-center">
          <FileText className="mx-auto text-stone-300" size={36} />
          <p className="mt-3 text-stone-500">Aucune facture pour l'instant.</p>
          <button onClick={onNew} className="mt-4 text-sm text-amber-700 font-medium hover:underline">
            Créer votre première facture →
          </button>
        </div>
      ) : (
        <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
          {invoices
            .slice()
            .reverse()
            .map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between px-5 py-4 border-b border-stone-100 last:border-b-0 hover:bg-stone-50 transition-colors"
              >
                <button onClick={() => onOpen(inv)} className="flex-1 text-left">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-sm text-stone-400">{inv.number}</span>
                    <span className="font-medium">{inv.clientName || "Sans nom"}</span>
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">{inv.date}</div>
                </button>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-semibold">
                    {formatMoney(inv.items.reduce((s, it) => s + it.qty * it.price, 0), myInfo.currency)}
                  </span>
                  <button onClick={() => onEdit(inv)} className="text-xs text-stone-500 hover:text-stone-900">
                    Modifier
                  </button>
                  <button onClick={() => onDelete(inv.id)} className="text-stone-300 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {showInfo && InfoModal && (
        <InfoModal
          myInfo={myInfo}
          isPro={isPro}
          onSave={onUpdateInfo}
          onClose={() => setShowInfo(false)}
          onUpgrade={() => {
            setShowInfo(false);
            onShowUpgrade();
          }}
        />
      )}
    </div>
  );
}
