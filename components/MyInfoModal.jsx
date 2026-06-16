import React, { useState } from "react";
import Field from "./Field";

export default function MyInfoModal({ myInfo, isPro, onSave, onClose, onUpgrade, CURRENCIES = [], TEMPLATES = [], ACCENT_COLORS = [] }) {
  const [form, setForm] = useState(myInfo);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert("Le logo doit faire moins de 1 Mo.");
      return;
    }
    // Show client-side preview immediately
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, logo: reader.result });
    reader.readAsDataURL(file);

    // Try uploading & saving to Supabase in background
    handleLogoUploadAndSave(file);
  };

  const handleLogoUploadAndSave = async (file) => {
    try {
      const { supabase } = await import("../lib/supabaseClient");
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (userId) {
        // call service to upload
        const { uploadLogo } = await import("../lib/services/settingsService");
        const res = await uploadLogo(userId, file);
        if (res.error) throw res.error;
        const publicUrl = res.data;
        setForm({ ...form, logo: publicUrl });
        return;
      }
    } catch (e) {
      // fallback to client-side preview
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const { supabase } = await import("../lib/supabaseClient");
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (userId) {
        const { removeLogo } = await import("../lib/services/settingsService");
        await removeLogo(userId, form.logo);
      }
    } catch (e) {
      // ignore
    }
    setForm({ ...form, logo: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="font-bold text-lg mb-4">Vos informations</h2>
        <div className="space-y-3">
          <Field label="Nom / Raison sociale" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Adresse" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <Field label="SIRET (optionnel)" value={form.siret} onChange={(v) => setForm({ ...form, siret: v })} />

          <label className="block">
            <span className="text-xs font-medium text-stone-500">Devise</span>
            <select
              value={form.currency || "EUR"}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-stone-400 mt-1">Utilisée pour le formatage des montants sur vos factures.</p>
          </label>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-stone-500">Logo</span>
              {!isPro && (
                <span className="text-[10px] uppercase tracking-widest bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-mono">
                  Pro
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3">
              {form.logo ? (
                <img src={form.logo} alt="Logo" className="h-12 w-12 object-contain border border-stone-200 rounded-lg bg-stone-50" />
              ) : (
                <div className="h-12 w-12 border border-dashed border-stone-300 rounded-lg flex items-center justify-center text-stone-300 text-xs">
                  Logo
                </div>
              )}
              <label className="text-sm px-3 py-2 rounded-lg border border-stone-300 cursor-pointer hover:bg-stone-50">
                {form.logo ? "Changer" : "Importer"}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              {form.logo && (
                <button onClick={handleRemoveLogo} className="text-xs text-stone-400 hover:text-red-500">
                  Retirer
                </button>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-1">PNG ou JPG, max 1 Mo.</p>
            {!isPro && (
              <p className="text-xs text-amber-700 mt-1">
                Le logo s'affichera sur vos factures avec l'abonnement {" "}
                <button onClick={onUpgrade} className="underline font-medium">
                  Pro
                </button>
                .
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-stone-500">Modèle de facture</span>
              {!isPro && (
                <span className="text-[10px] uppercase tracking-widest bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-mono">
                  Pro
                </span>
              )}
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {TEMPLATES.map((t) => {
                const locked = t.pro && !isPro;
                const selected = form.template === t.id;
                const acc = form.accentColor || t.accent;
                const previewBg = {
                  classic: "#f5f5f4",
                  modern: `linear-gradient(135deg, ${acc}, #fff)`,
                  minimal: "#fff",
                  bold: acc,
                  dark: "#18181b",
                  geometric: `radial-gradient(circle at 70% 30%, ${acc}33, #fff 60%)`,
                  elegant: `linear-gradient(#fff, #fff)`,
                  ledger: `repeating-linear-gradient(45deg, #fff, #fff 6px, ${acc}15 6px, ${acc}15 7px)`,
                }[t.id];
                return (
                  <button
                    key={t.id}
                    disabled={locked}
                    onClick={() => !locked && setForm({ ...form, template: t.id })}
                    className={`relative text-left rounded-lg border p-2.5 transition-colors ${
                      selected ? "border-stone-900 ring-1 ring-stone-900" : "border-stone-200"
                    } ${locked ? "opacity-50 cursor-not-allowed" : "hover:border-stone-400"}`}
                  >
                    <div
                      className="h-8 rounded mb-1.5"
                      style={{
                        background: previewBg,
                        border: t.id === "minimal" || t.id === "elegant" ? "1px solid #e7e5e4" : "none",
                      }}
                    />
                    <span className="text-xs font-medium flex items-center gap-1">
                      {t.name}
                      {locked && <span className="text-stone-400">🔒</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            {!isPro && (
              <p className="text-xs text-amber-700 mt-1.5">
                Débloquez 7 nouveaux modèles avec {" "}
                <button onClick={onUpgrade} className="underline font-medium">
                  Pro
                </button>
                .
              </p>
            )}
          </div>

          {isPro && (
            <div>
              <span className="text-xs font-medium text-stone-500">Couleur d'accent</span>
              <div className="mt-1.5 flex gap-2">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, accentColor: c })}
                    className={`h-7 w-7 rounded-full border-2 transition-transform ${
                      form.accentColor === c ? "border-stone-900 scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-stone-300">
            Annuler
          </button>
          <button
            onClick={() => {
              onSave(form);
              onClose();
            }}
            className="px-4 py-2 text-sm rounded-lg bg-stone-900 text-white"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
