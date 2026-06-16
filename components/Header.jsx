import React from "react";
import { APP_NAME } from "../constants";
import { openSubscription } from "../utils/stripe";

export default function Header({ isPro, invoicesCount = 0, freeLimit = 3, onGuide, onShowUpgrade, onOpenUpgradePage, onAuthOpen }) {
  return (
    <header className="no-print border-b border-stone-200 bg-white">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
            {APP_NAME}
          </span>
          {isPro && (
            <span className="text-[10px] uppercase tracking-widest bg-amber-600 text-white px-2 py-0.5 rounded-full font-mono">
              Pro
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isPro && (
            <span className="text-xs text-stone-500 font-mono">
              {invoicesCount}/{freeLimit} factures
            </span>
          )}
          <button onClick={onGuide} className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors">
            Guide
          </button>

          <button
            onClick={() => onOpenUpgradePage && onOpenUpgradePage()}
            className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            Premium
          </button>

          <button onClick={() => onAuthOpen && onAuthOpen()} className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors">
            Se connecter
          </button>

          {!isPro && (
            <button
              onClick={() => openSubscription()}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            >
              Passer à {APP_NAME} Pro
            </button>
          )}

          <button
            onClick={onShowUpgrade}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-stone-300 hover:border-amber-600 hover:text-amber-700 transition-colors"
          >
            {isPro ? "Gérer l'abonnement" : "Passer Pro"}
          </button>
        </div>
      </div>
    </header>
  );
}
