import React, { useState } from "react";
import useAuth from "../hooks/useAuth";

export default function AuthModal({ open = false, onClose }) {
  const { user, signIn, signUp, signOut, loading } = useAuth();
  const [mode, setMode] = useState("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (mode === "signIn") {
      const res = await signIn(email, password);
      if (res?.error) setMessage(res.error.message || String(res.error));
      else onClose && onClose();
    } else {
      const res = await signUp(email, password);
      if (res?.error) setMessage(res.error.message || String(res.error));
      else setMessage("Un e-mail de confirmation a été envoyé si nécessaire.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{mode === "signIn" ? "Se connecter" : "S'inscrire"}</h2>
          <button onClick={onClose} className="text-sm text-stone-400 hover:underline">Fermer</button>
        </div>

        {user ? (
          <div className="space-y-3">
            <p className="text-sm">Connecté en tant que {user.email}</p>
            <button onClick={() => signOut()} className="w-full py-2 rounded-lg border">Se déconnecter</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full mt-1 p-2 border rounded" />
            </div>
            <div>
              <label className="text-sm">Mot de passe</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full mt-1 p-2 border rounded" />
            </div>
            {message && <p className="text-sm text-rose-600">{message}</p>}

            <button type="submit" disabled={loading} className="w-full py-2 rounded-lg bg-amber-600 text-white">
              {mode === "signIn" ? "Se connecter" : "S'inscrire"}
            </button>

            <div className="text-center text-sm text-stone-500">
              {mode === "signIn" ? (
                <>
                  Pas encore de compte ? <button type="button" onClick={() => setMode("signUp")} className="text-amber-600">Créer</button>
                </>
              ) : (
                <>
                  Déjà inscrit ? <button type="button" onClick={() => setMode("signIn")} className="text-amber-600">Se connecter</button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
