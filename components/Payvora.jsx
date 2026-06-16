import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Download, Users, FileText, Lock, Sparkles, Printer, X } from "lucide-react";
import Header from "./Header";
import AuthModal from "./AuthModal";
import ListView from "./ListView";
import Field from "./Field";
import MyInfoModal from "./MyInfoModal";
import EditView from "./EditView";
import PreviewView from "./PreviewView";
import UpgradePage from "./UpgradePage";
import formatMoney from "../utils/formatCurrency";
import { FREE_LIMIT, APP_NAME, STRIPE_ACCOUNT_ID, STRIPE_PAYMENT_LINK, CURRENCIES, TEMPLATES, ACCENT_COLORS } from "../constants";
import useInvoices from "../hooks/useInvoices";
import useMyInfo from "../hooks/useMyInfo";
import useAuth from "../hooks/useAuth";
import useProfile from "../hooks/useProfile";

const emptyInvoice = () => ({
  id: `inv_${Date.now()}`,
  number: "",
  clientName: "",
  clientAddress: "",
  date: new Date().toISOString().slice(0, 10),
  dueDate: "",
  items: [{ id: "1", label: "", qty: 1, price: 0 }],
  notes: "",
  createdAt: Date.now(),
});
// Shared CURRENCIES, TEMPLATES and accent colors live in `constants/index.js`

export default function Payvora() {
  const { invoices, setInvoices, persistInvoices, loading: invoicesLoading } = useInvoices();
  const { myInfo, setMyInfo, persistInfo, loading: myInfoLoading } = useMyInfo();
  const [view, setView] = useState("list"); // list | edit | preview | guide
  const [current, setCurrent] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [proLoading, setProLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showProNotice, setShowProNotice] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, session } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile(user?.id);

  const loading = invoicesLoading || myInfoLoading || proLoading || profileLoading;

  useEffect(() => {
    (async () => {
      try {
        if (user) {
          // If we have a profile from Supabase, prefer that flag
          if (profile && typeof profile.is_pro !== "undefined") {
            setIsPro(!!profile.is_pro);
            // If profile is not pro but local storage indicates pro, migrate it
            try {
              const local = await window.storage.get("isPro");
              const localIsPro = local ? JSON.parse(local.value) : false;
              if (localIsPro && !profile.is_pro) {
                // upsert profile to mark as pro
                await updateProfile(user.id, { is_pro: true });
                setIsPro(true);
              }
            } catch (e) {
              // ignore migration errors
            }
            // trigger migration of invoices/settings from local storage to Supabase
            try {
              const migrated = await window.storage.get('migrated_v1');
              if (!migrated && session) {
                const { migrateLocalDataToServer } = await import('../lib/hooks/services/migrateData');
                migrateLocalDataToServer(session).then(() => {
                  // silent
                }).catch(() => {});
              }
            } catch (e) {}
          }
        } else {
          const pro = await window.storage.get("isPro");
          if (pro) setIsPro(JSON.parse(pro.value));
        }
      } catch (e) {}
      setProLoading(false);
    })();
  }, [user, profile]);

  const togglePro = async () => {
    const next = !isPro;
    setIsPro(next);
    try {
      await window.storage.set("isPro", JSON.stringify(next));
    } catch (e) {}
    setShowUpgrade(false);
  };

  const startNew = () => {
    if (!isPro && invoices.length >= FREE_LIMIT) {
      setShowUpgrade(true);
      return;
    }
    const inv = emptyInvoice();
    inv.number = `F-${String(invoices.length + 1).padStart(4, "0")}`;
    setCurrent(inv);
    setView("edit");
  };

  const saveInvoice = () => {
    const exists = invoices.find((i) => i.id === current.id);
    let next;
    if (exists) {
      next = invoices.map((i) => (i.id === current.id ? current : i));
    } else {
      next = [...invoices, current];
    }
    persistInvoices(next);
    setView("preview");
    if (!isPro) setShowProNotice(true);
  };

  const deleteInvoice = (id) => {
    persistInvoices(invoices.filter((i) => i.id !== id));
  };

  const total = useMemo(() => {
    if (!current) return 0;
    return current.items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  }, [current]);

  const updateItem = (id, field, value) => {
    setCurrent((c) => ({
      ...c,
      items: c.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    }));
  };

  const addItem = () => {
    setCurrent((c) => ({
      ...c,
      items: [...c.items, { id: `${Date.now()}`, label: "", qty: 1, price: 0 }],
    }));
  };

  const removeItem = (id) => {
    setCurrent((c) => ({ ...c, items: c.items.filter((it) => it.id !== id) }));
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-400 font-mono text-sm">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; margin: 0 !important; }
          body { background: white !important; }
        }
      `}</style>

      {/* Header */}
      <Header
        isPro={isPro}
        invoicesCount={invoices.length}
        freeLimit={FREE_LIMIT}
        onGuide={() => setView("guide")}
        onShowUpgrade={() => setShowUpgrade(true)}
        onOpenUpgradePage={() => setView("upgrade")}
        onAuthOpen={() => setShowAuth(true)}
      />

      <main className="max-w-5xl mx-auto px-5 py-8">
        {view === "list" && (
          <ListView
            invoices={invoices}
            onNew={startNew}
            onOpen={(inv) => {
              setCurrent(inv);
              setView("preview");
            }}
            onEdit={(inv) => {
              setCurrent(inv);
              setView("edit");
            }}
            onDelete={deleteInvoice}
            myInfo={myInfo}
            onUpdateInfo={persistInfo}
            isPro={isPro}
            onShowUpgrade={() => setShowUpgrade(true)}
            InfoModal={(props) => (
              <MyInfoModal {...props} CURRENCIES={CURRENCIES} TEMPLATES={TEMPLATES} ACCENT_COLORS={ACCENT_COLORS} />
            )}
            formatMoney={formatMoney}
          />
        )}

        {view === "edit" && current && (
          <EditView
            current={current}
            setCurrent={setCurrent}
            total={total}
            updateItem={updateItem}
            addItem={addItem}
            removeItem={removeItem}
            onCancel={() => setView("list")}
            onSave={saveInvoice}
            myInfo={myInfo}
            formatMoney={formatMoney}
            CURRENCIES={CURRENCIES}
          />
        )}

        {view === "preview" && current && (
          <PreviewView
            invoice={current}
            myInfo={myInfo}
            isPro={isPro}
            onBack={() => setView("list")}
            onEdit={() => setView("edit")}
            onPrint={printInvoice}
            onShowUpgrade={() => setShowUpgrade(true)}
            showProNotice={showProNotice}
            onCloseProNotice={() => setShowProNotice(false)}
            invoiceCount={invoices.length}
            formatMoney={formatMoney}
          />
        )}

        {view === "guide" && (
          <GuideView isPro={isPro} onBack={() => setView("list")} onShowUpgrade={() => setShowUpgrade(true)} />
        )}

        {view === "upgrade" && <UpgradePage onBack={() => setView("list")} />}
      </main>

      {showUpgrade && <UpgradeModal isPro={isPro} onToggle={togglePro} onClose={() => setShowUpgrade(false)} />}
      {showAuth && <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />}
    </div>
  );
}

// ListView component moved to components/ListView.jsx

// MyInfoModal component moved to components/MyInfoModal.jsx

// Field component moved to components/Field.jsx

// EditView component moved to components/EditView.jsx
// Layouts moved to components/layouts/* and Preview moved to components/PreviewView.jsx

function GuideStep({ number, title, children }) {
  return (
    <div className="flex gap-4">
      <div className="flex-none w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-sm font-bold font-mono">
        {number}
      </div>
      <div className="pt-0.5">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-stone-600 mt-1">{children}</p>
      </div>
    </div>
  );
}

function GuideView({ isPro, onBack, onShowUpgrade }) {
  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-sm text-stone-500 hover:text-stone-900 mb-4">
        ← Retour
      </button>

      <h1 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif" }}>
        Guide d'utilisation
      </h1>
      <p className="text-sm text-stone-500 mt-1 mb-8">
        Tout ce qu'il faut savoir pour créer vos premières factures en quelques minutes.
      </p>

      <div className="space-y-6 mb-10">
        <GuideStep number="1" title="Renseignez vos informations">
          Cliquez sur "Mes infos" depuis la liste des factures pour ajouter le nom de votre entreprise, votre
          adresse et votre numéro SIRET. Ces informations apparaîtront automatiquement sur chaque facture.
        </GuideStep>
        <GuideStep number="2" title="Créez une facture">
          Cliquez sur "Nouvelle facture", renseignez le client, la date et l'échéance, puis ajoutez vos
          prestations (description, quantité, prix unitaire). Le total se calcule automatiquement.
        </GuideStep>
        <GuideStep number="3" title="Prévisualisez et enregistrez">
          Une fois enregistrée, votre facture s'affiche en aperçu prêt à être envoyé. Vous pouvez la modifier à
          tout moment depuis la liste.
        </GuideStep>
        <GuideStep number="4" title="Imprimez ou téléchargez en PDF">
          Les boutons "Imprimer" et "Télécharger PDF" ouvrent la boîte de dialogue d'impression de votre
          navigateur — choisissez "Enregistrer en PDF" pour obtenir un fichier à envoyer par e-mail. En version
          gratuite, une mention "{APP_NAME}" apparaît en bas du document.
        </GuideStep>
        <GuideStep number="5" title="Gérez votre historique">
          Toutes vos factures restent accessibles depuis la liste principale, avec leur montant et leur date.
          Vous pouvez les rouvrir, les modifier ou les supprimer à tout moment.
        </GuideStep>
      </div>

      <div className="border border-stone-200 rounded-xl p-6 bg-white">
        <h2 className="font-bold mb-3">Limites du plan gratuit</h2>
        <ul className="text-sm text-stone-600 space-y-1.5">
          <li>• Jusqu'à {FREE_LIMIT} factures au total</li>
          <li>• Modèle "Classique" uniquement, sans logo</li>
          <li>• Impression / export PDF disponibles, mais avec la mention "{APP_NAME}" en bas de page</li>
        </ul>
      </div>

      <div
        className="mt-4 rounded-xl p-6 text-center"
        style={{ background: isPro ? "#f5f5f4" : "linear-gradient(135deg, #fde68a22, #f5f5f4)" }}
      >
        {isPro ? (
          <>
            <Sparkles className="mx-auto text-amber-500 mb-2" size={24} />
            <h2 className="font-bold">Vous profitez déjà de l'offre Pro</h2>
            <p className="text-sm text-stone-600 mt-1">
              Factures illimitées, 8 modèles de design, logo personnalisé et PDF sans filigrane.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-bold">Besoin de plus ?</h2>
            <p className="text-sm text-stone-600 mt-1 mb-3">
              Passez Pro pour des factures illimitées, votre logo, 8 modèles de design et des PDF sans la mention "{APP_NAME}".
            </p>
            <button
              onClick={onShowUpgrade}
              className="px-4 py-2 text-sm rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
            >
              Passer Pro — 9,99 €/mois
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function UpgradeModal({ isPro, onToggle, onClose }) {
  const handleSubscribe = () => {
    if (STRIPE_PAYMENT_LINK) {
      window.open(STRIPE_PAYMENT_LINK, "_blank");
    } else {
      onToggle();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
        {isPro ? (
          <>
            <Sparkles className="mx-auto text-amber-500" size={28} />
            <h2 className="font-bold text-lg mt-3">Vous êtes Pro</h2>
            <p className="text-sm text-stone-500 mt-2">Factures illimitées, sans filigrane.</p>
            <button onClick={onToggle} className="mt-5 text-xs text-stone-400 hover:underline">
              Annuler l'abonnement (démo)
            </button>
          </>
        ) : (
          <>
            <Lock className="mx-auto text-stone-400" size={28} />
            <h2 className="font-bold text-lg mt-3">Passer à Pro</h2>
            <p className="text-sm text-stone-500 mt-2">
              Le plan gratuit est limité à {FREE_LIMIT} factures. Débloquez l'illimité.
            </p>
            <div className="mt-4 border border-amber-200 bg-amber-50 rounded-lg p-4">
              <p className="text-2xl font-bold">9,99 € <span className="text-sm font-normal text-stone-500">/ mois</span></p>
              <ul className="text-sm text-stone-600 mt-2 space-y-1 text-left">
                <li>✓ Factures illimitées</li>
                <li>✓ Aucune mention "{APP_NAME}" sur vos PDF</li>
                <li>✓ Logo personnalisé sur vos factures</li>
                <li>✓ 8 modèles de design + couleurs</li>
              </ul>
            </div>
            <button
              onClick={handleSubscribe}
              className="mt-4 w-full py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
            >
              {STRIPE_PAYMENT_LINK ? "S'abonner avec Stripe" : "S'abonner (démo)"}
            </button>
            {!STRIPE_PAYMENT_LINK && (
              <p className="text-[11px] text-stone-400 mt-2">
                Mode démo : le paiement Stripe n'est pas encore configuré.
              </p>
            )}
          </>
        )}
        <button onClick={onClose} className="mt-3 text-xs text-stone-400 hover:underline">
          Fermer
        </button>
      </div>
    </div>
  );
}
