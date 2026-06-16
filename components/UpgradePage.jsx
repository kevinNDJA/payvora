import React from "react";
import { APP_NAME, FREE_LIMIT } from "../constants";
import { openSubscription } from "../utils/stripe";

export default function UpgradePage({ onBack }) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="text-sm text-stone-500 hover:text-stone-900 mb-4">
        ← Retour
      </button>

      <h1 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif" }}>
        {APP_NAME} — Premium
      </h1>
      <p className="text-sm text-stone-500 mt-1 mb-6">Passez à Pro pour débloquer les fonctionnalités suivantes.</p>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="font-semibold mb-2">Fonctionnalités gratuites</h3>
          <ul className="text-sm text-stone-600 space-y-1">
            <li>• Jusqu'à {FREE_LIMIT} factures</li>
            <li>• Modèle "Classique" inclus</li>
            <li>• Impression / export PDF (avec mention "{APP_NAME}")</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <h3 className="font-semibold mb-2">Fonctionnalités Payvora Pro <span className="ml-2 inline-block text-[11px] uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">PRO</span></h3>
          <ul className="text-sm text-stone-600 space-y-1">
            <li>✓ Factures illimitées <span className="ml-2 inline-block text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">PRO</span></li>
            <li>✓ 8 modèles de design supplémentaires <span className="ml-2 inline-block text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">PRO</span></li>
            <li>✓ Logo personnalisé sur vos factures <span className="ml-2 inline-block text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">PRO</span></li>
            <li>✓ PDF sans mention "{APP_NAME}" <span className="ml-2 inline-block text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">PRO</span></li>
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg p-6 border text-center">
        <p className="text-sm text-stone-600">Abonnement mensuel sans engagement</p>
        <p className="text-2xl font-bold mt-2">9,99 € <span className="text-sm font-normal text-stone-500">/ mois</span></p>
        <button
          onClick={() => openSubscription()}
          className="mt-4 px-6 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
        >
          Passer à {APP_NAME} Pro — 9,99 €/mois
        </button>
      </div>
    </div>
  );
}
