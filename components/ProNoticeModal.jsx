import React from "react";
import { X, Sparkles } from "lucide-react";
import { FREE_LIMIT, APP_NAME } from "../constants";

export default function ProNoticeModal({ onClose, onUpgrade, invoiceCount }) {
  const remaining = Math.max(0, FREE_LIMIT - invoiceCount);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm relative text-center">
        <button onClick={onClose} className="absolute top-3 right-3 text-stone-400 hover:text-stone-700">
          <X size={18} />
        </button>
        <Sparkles className="mx-auto text-amber-500" size={28} />
        <h2 className="font-bold text-lg mt-3">Facture enregistrée 🎉</h2>
        <p className="text-sm text-stone-500 mt-2">
          {remaining > 0
            ? `Il vous reste ${remaining} facture(s) gratuite(s). Passez Pro pour des factures illimitées, votre logo, 8 modèles de design et la suppression du filigrane "${APP_NAME}".`
            : `Vous avez atteint la limite gratuite de ${FREE_LIMIT} factures. Passez Pro pour continuer à facturer sans limite.`}
        </p>
        <div className="mt-4 border border-amber-200 bg-amber-50 rounded-lg p-4">
          <p className="text-2xl font-bold">
            9,99 € <span className="text-sm font-normal text-stone-500">/ mois</span>
          </p>
          <ul className="text-sm text-stone-600 mt-2 space-y-1 text-left">
            <li>✓ Factures illimitées</li>
            <li>✓ Aucune mention "{APP_NAME}" sur vos PDF</li>
            <li>✓ Logo personnalisé</li>
            <li>✓ 8 modèles de design + couleurs</li>
          </ul>
        </div>
        <button
          onClick={onUpgrade}
          className="mt-4 w-full py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
        >
          Passer Pro
        </button>
        <button onClick={onClose} className="mt-3 text-xs text-stone-400 hover:underline">
          Continuer avec le plan gratuit
        </button>
      </div>
    </div>
  );
}
