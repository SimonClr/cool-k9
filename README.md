# Cool K9 - Dog Trainer App

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

Application de gestion de séances d'éducation canine construite avec un monorepo Nx.

## Architecture du projet

Ce projet utilise [Nx](https://nx.dev) pour gérer un monorepo contenant :

- **cool-k9-front** : Application React frontend
- **cool-k9-back** : API NestJS backend
- **models** : Bibliothèque partagée de modèles TypeScript (`@models`)
- **authentication** : Bibliothèque partagée de gestion de l'authentification (`@authentication`)

## Stack technique

### Frontend (cool-k9-front)
- **React 19** - Framework UI avec hooks et functional components
- **Vite 7** - Build tool et dev server ultra-rapide
- **TypeScript** - Typage statique
- **React Router 6** - Routage côté client
- **Tailwind CSS 3** - Framework CSS utility-first
- **shadcn/ui** - Composants UI construits sur Radix UI
- **lucide-react** - Bibliothèque d'icônes

### Backend (cool-k9-back)
- **NestJS** - Framework Node.js progressif
- **TypeScript** - Typage statique

### Libs partagées
- **@models** - Types et interfaces partagés entre frontend et backend
- **@authentication** - Contexte d'authentification React (`AuthProvider`, `useAuth`, `ProtectedRoute`) basé sur Supabase

## Prérequis

- Node.js (version recommandée : 18+)
- pnpm (gestionnaire de packages)
- Un projet Supabase (voir [Configuration Supabase](#configuration-supabase))

## Installation

```sh
pnpm install
```

## Configuration Supabase

L'app utilise Supabase pour l'authentification et la base de données. Deux fichiers `.env` sont nécessaires (templates fournis dans `*.env.example`) :

`apps/cool-k9-front/.env`
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

`apps/cool-k9-back/.env`
```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

### Créer (ou recréer) un projet Supabase

1. Créer un projet sur [supabase.com/dashboard](https://supabase.com/dashboard).
2. Copier les clés depuis Settings → API et mettre à jour les deux `.env` ci-dessus.
3. Désactiver la confirmation email : Authentication → Providers → Email → décocher *Confirm email* → Save.
4. Coller le contenu de [`supabase/schema.sql`](supabase/schema.sql) dans le SQL Editor du projet et exécuter.
5. Lancer le front (`pnpm start:front`), aller sur `/register`, créer un compte.

> **Note** : ne jamais utiliser le claim `role` dans `app_metadata` (réservé par GoTrue, casse l'auth). Le claim custom est `app_role`.

### Anti-pause (tier gratuit)

Le tier gratuit Supabase pause les projets après ~7 jours d'inactivité. Un workflow GitHub Actions ([`.github/workflows/supabase-keepalive.yml`](.github/workflows/supabase-keepalive.yml)) ping la base tous les 3 jours pour empêcher la pause. Pour qu'il fonctionne, ajouter ces secrets dans Settings → Secrets and variables → Actions :

- `SUPABASE_URL` (même valeur que `apps/cool-k9-back/.env`)
- `SUPABASE_SERVICE_ROLE_KEY` (même valeur que `apps/cool-k9-back/.env`)

## Commandes de développement

### Démarrer le frontend

```sh
pnpm start:front
# ou
nx serve cool-k9-front
```

L'application sera disponible sur [http://localhost:4200](http://localhost:4200)

### Démarrer le backend

```sh
pnpm start:back
# ou
nx serve cool-k9-back
```

L'API sera disponible sur [http://localhost:3000](http://localhost:3000)

### Démarrer frontend et backend simultanément

```sh
pnpm start
```

## Commandes de build

### Build du frontend

```sh
pnpm build:front
# ou
nx build cool-k9-front
```

### Build du backend

```sh
pnpm build:back
# ou
nx build cool-k9-back
```

### Build complet (frontend + backend + libs)

```sh
pnpm build
# ou
nx run-many -t build
```

## Structure du code

L'archi est **feature-based** côté front et **modulaire NestJS** côté back. Le détail des conventions est dans [`CLAUDE.md`](CLAUDE.md).

```
cool-k9/
├── apps/
│   ├── cool-k9-front/                       # Application React
│   │   └── src/
│   │       ├── app/
│   │       │   ├── features/                # Une feature par dossier
│   │       │   │   ├── auth/                # Login, Register
│   │       │   │   ├── sessions/            # Séances (components, hooks, services, api, types, constants, utils)
│   │       │   │   ├── dogs/                # Chiens
│   │       │   │   ├── profile/             # Profil utilisateur
│   │       │   │   └── admin/               # Pages admin (Pricing…)
│   │       │   ├── layout/                  # Layout global, navigation
│   │       │   └── constants/               # Constantes globales (api.constants.ts…)
│   │       └── utils/                       # Fonctions pures partagées
│   └── cool-k9-back/                        # API NestJS
│       └── src/app/
│           ├── features/                    # Un module NestJS par feature
│           │   ├── sessions/
│           │   ├── dogs/
│           │   └── users/
│           ├── auth/                        # SupabaseAuthGuard, AdminGuard
│           └── supabase/                    # Client Supabase (service_role)
├── libs/
│   ├── models/                              # Types partagés (@models)
│   └── authentication/                      # Auth Supabase (@authentication)
├── supabase/
│   └── schema.sql                           # DDL des tables public.*
└── .github/workflows/
    ├── ci.yml
    └── supabase-keepalive.yml               # Ping Supabase tous les 3 jours
```

## Gestion des tâches Nx

Pour voir toutes les tâches disponibles pour un projet :

```sh
nx show project cool-k9-front
```

Pour visualiser le graphe de dépendances :

```sh
nx graph
```

## Génération de code

### Créer un nouveau composant React

```sh
nx g @nx/react:component my-component --project=cool-k9-front
```

### Créer une nouvelle bibliothèque

```sh
nx g @nx/react:lib my-lib
```

