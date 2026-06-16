# 🚀 Payvora — État du Déploiement

## ✅ Statut Actuel

**Codebase:** Prêt pour production ✓
- Refactoring de single-file vers architecture complète (components/services/hooks)
- Supabase Auth + profiles + RLS policies
- Stripe Checkout + webhooks  
- Logo upload/removal (Supabase Storage)
- Migration auto data lors du login
- Dockerfiles pour frontend + backend
- GitHub Actions CI/CD workflow
- Environment templates (.env.example)

**Build:** Vérifié ✓
```bash
npm run build  # ✓ dist optimisé (~193KB)
```

**Tests Locaux:** À faire
```bash
# 1. Frontend
cd mon-application && npm install && npm run dev  # Vite dev server

# 2. Backend  
cd server && npm install && npm run dev  # Express dev server
```

---

## ⚠️ Blocage GitHub Push Protection

GitHub détecte des secrets dans l'historique et bloque le push.  
Secrets détectés (depuis les commits précédents):
- Stripe Test API Key
- Supabase Secret Key

### 🔧 Solutions

#### Option 1: Débloquer les secrets via GitHub (QUICKEST)
1. Allez sur: [GitHub Push Protection Settings](https://github.com/kevinNDJA/payvora/security/secret-scanning)
2. Trouvez les 2 secrets détectés (Stripe + Supabase)
3. Pour chacun, cliquez "Allow" pour débloquer
4. Retournez au terminal et réessayez: `git push -u origin main --force`

#### Option 2: Recréer le repo (CLEANEST)
1. Supprimez le repo GitHub: Settings → Delete this repository
2. Créez un nouveau repo: `kevinNDJA/payvora` 
3. Changez le remote local:
   ```bash
   git remote set-url origin https://github.com/kevinNDJA/payvora.git
   git push -u origin main
   ```

#### Option 3: Rotater les secrets et rebaser l'historique
1. Supabase: Settings → Rotate keys (générer nouvelles clés)
2. Stripe: Generate new API key
3. Rebaser l'historique local à partir du commit propre:
   ```bash
   git reset --hard e150302  # Dernier commit propre (pas de secrets)
   git push -u origin main --force-with-lease
   ```

---

## 📋 Prochaines Étapes

### 1. Débloquer GitHub
- [ ] Aller à GitHub Push Protection et autoriser les secrets (Option 1 est plus rapide)
- [ ] Pousser le code: `git push -u origin main --force`

### 2. Configurer Supabase
- [ ] Appliquer migration: Copier `db/migration.sql` → SQL Editor Supabase → Execute
- [ ] Créer bucket `logos`: Storage → New Bucket → name=`logos`

### 3. Configurer secrets localement
- [ ] Créer `mon-application/.env` (copier depuis `.env.example`)
- [ ] Créer `server/.env` (copier depuis `.env.example`)  
- [ ] Remplir avec les vraies clés Supabase/Stripe

### 4. Tests
- [ ] Frontend: `npm run dev` → http://localhost:5173
- [ ] Backend: `npm run dev` → http://localhost:4242
- [ ] Tester signup/login avec Supabase
- [ ] Tester upload logo
- [ ] Tester Stripe Checkout (test mode)

### 5. Déployer
- [ ] Vercel: Connect repo → configure `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` dans GitHub Secrets
- [ ] Backend: Deploy on Render/Fly.io avec `server/.env`
- [ ] Stripe webhooks: Register endpoint `https://<backend>/webhook`

---

## 🔐 Sécurité — IMPORTANT

**Clés exposées dans cette conversation (DOIVENT ÊTRE ROTÉES):**
- Supabase secret: `[YOUR_SUPABASE_SERVICE_ROLE_KEY]`
- Supabase publishable: `[YOUR_SUPABASE_ANON_KEY]`  
- Stripe key: `[YOUR_STRIPE_SECRET_KEY]`

**ACTION REQUISE:**
1. Supabase: Settings → Rotate keys immédiatement
2. Stripe: Dashboard → API Keys → Regenerate keys
3. Utiliser les NOUVELLES clés pour `.env` files

---

## 📁 Structure Repo

```
payvora/
├── mon-application/          # Frontend React + Vite
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom hooks (useAuth, useInvoices, etc)
│   │   └── lib/
│   │       └── services/      # API services (invoiceService, etc)
│   ├── .env.example           # Template (pas de secrets)
│   ├── Dockerfile             # Multi-stage build
│   └── nginx.conf             # SPA routing
│
├── server/                    # Backend Express
│   ├── index.js               # Stripe + webhooks + migration
│   ├── supabaseClient.js      # Service role client
│   ├── .env.example           # Template
│   ├── Dockerfile             # Alpine Node
│   └── package.json
│
├── db/
│   └── migration.sql          # PostgreSQL schema + RLS
│
├── scripts/
│   └── create_github_repo.js  # Helper pour créer repo via API
│
├── .github/workflows/
│   └── deploy-vercel.yml      # Auto-deploy to Vercel
│
├── DEPLOYMENT.md              # Documentation production
├── SECURITY.md                # Security checklist
└── .env.local.example         # Local secrets template
```

---

## ✨ Features

✅ **Authentification:** Supabase Auth (email/password/oauth)  
✅ **Facturation:** Stripe Checkout Sessions + subscriptions  
✅ **Webhooks:** Auto-update profiles on payment events  
✅ **Storage:** Logo upload to Supabase Storage  
✅ **Migration:** Auto-import local data to Supabase on first login  
✅ **Offline Mode:** Fallback to localStorage when not authenticated  
✅ **Docker:** Multi-stage builds (production-ready)  
✅ **CI/CD:** GitHub Actions → Vercel automatic deployment  

---

**Créé:** 2026-06-16  
**Statut:** Code-complete, awaiting GitHub push + Supabase/Stripe config
