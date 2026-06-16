import React from "react";
import { Printer, Download, X, Sparkles } from "lucide-react";
import ProNoticeModal from "./ProNoticeModal";
import LineItemsTable from "./LineItemsTable";
import * as layoutComponents from "./layouts";
import { APP_NAME } from "../constants";

export default function PreviewView({ invoice, myInfo, isPro, onBack, onEdit, onPrint, onShowUpgrade, showProNotice, onCloseProNotice, invoiceCount, formatMoney }) {
  const total = invoice.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  const templateId = isPro ? myInfo.template || "classic" : "classic";
  const accent = isPro ? myInfo.accentColor || "#d97706" : "#1c1917";

  const comps = {
    classic: layoutComponents.Classic,
    modern: layoutComponents.Modern,
    minimal: layoutComponents.Minimal,
    bold: layoutComponents.Bold,
    dark: layoutComponents.Dark,
    geometric: layoutComponents.Geometric,
    elegant: layoutComponents.Elegant,
    ledger: layoutComponents.Ledger,
  };

  const Layout = comps[templateId] || layoutComponents.Classic;

  return (
    <div>
      <div className="no-print flex justify-between items-center mb-4 max-w-2xl mx-auto">
        <button onClick={onBack} className="text-sm text-stone-500 hover:text-stone-900">
          ← Retour
        </button>
        <div className="flex gap-2">
          <button onClick={onEdit} className="px-3 py-1.5 text-sm rounded-lg border border-stone-300">
            Modifier
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-stone-300 hover:bg-stone-50"
          >
            <Printer size={14} /> Imprimer
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-stone-900 text-white"
          >
            <Download size={14} /> Télécharger PDF
          </button>
        </div>
      </div>

      {!isPro && (
        <div className="no-print max-w-2xl mx-auto mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          La mention "{APP_NAME}" apparaît en bas de vos factures imprimées/exportées en version gratuite. {" "}
          <button onClick={onShowUpgrade} className="underline font-medium">
            Passer Pro
          </button>{" "}
          pour la retirer.
        </div>
      )}

      <Layout invoice={invoice} myInfo={myInfo} isPro={isPro} accent={accent} total={total} formatMoney={formatMoney} />

      {!isPro && showProNotice && (
        <ProNoticeModal onClose={onCloseProNotice} onUpgrade={onShowUpgrade} invoiceCount={invoiceCount} />
      )}
    </div>
  );
}
