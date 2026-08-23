# Cool K9 - Dog Trainer App

Application de gestion de séances d'éducation canine construite avec un monorepo Nx.

## Architecture du projet

Ce projet utilise [Nx](https://nx.dev) pour gérer un monorepo contenant :

- **cool-k9-front** : Application React frontend
- **cool-k9-back** : API NestJS backend
- **models** : Bibliothèque partagée de modèles TypeScript (`@models`)

## Stack technique

### Frontend (cool-k9-front)

- **React 19** - Framework UI avec hooks et functional components
- **Vite 7** - Build tool et dev server ultra-rapide
- **TypeScript** - Typage statique
- **React Router 6** - Routage côté client
- **Tailwind CSS v4** - Framework CSS utility-first
- **shadcn/ui** - Composants UI construits sur Radix UI
- **React Hook Form + Zod** - Gestion des formulaires et validation par schéma
- **lucide-react** - Bibliothèque d'icônes

### Backend (cool-k9-back)

- **NestJS** - Framework Node.js progressif
- **TypeScript** - Typage statique
- **Helmet** - En-têtes de sécurité HTTP
- **@nestjs/throttler** - Limitation du débit de requêtes par IP
- **class-validator / class-transformer** - Validation stricte des corps de requête
- **Zod** - Validation des variables d'environnement au démarrage

### Libs partagées

- **@models** - Types et interfaces partagés entre frontend et backend

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
VITE_API_BASE_URL=http://localhost:3000/api
```

`apps/cool-k9-back/.env`

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
CORS_ORIGINS=http://localhost:4200
```

> Ces variables sont **toutes obligatoires**. Le backend valide les siennes au démarrage et s'arrête en nommant celle qui manque ; le build du frontend échoue de la même manière. Aucune valeur de repli n'est appliquée, pour qu'un déploiement mal configuré échoue franchement au lieu de tourner dans un état dégradé.
>
> `CORS_ORIGINS` accepte plusieurs origines séparées par des virgules (ex. `http://localhost:4200,https://mon-domaine.fr`).
>
> Les variables préfixées `VITE_` sont **inscrites en clair** dans les fichiers livrés au navigateur : n'y placer aucun secret.

### Créer (ou recréer) un projet Supabase

1. Créer un projet sur [supabase.com/dashboard](https://supabase.com/dashboard).
2. Copier les clés depuis Settings → API et mettre à jour les deux `.env` ci-dessus.
3. Désactiver la confirmation email : Authentication → Providers → Email → décocher *Confirm email* → Save.
4. Coller le contenu de [`supabase/schema.sql`](supabase/schema.sql) dans le SQL Editor du projet et exécuter.
5. Lancer le front (`pnpm start:front`), aller sur `/register`, créer un compte.

> **Note** : ne jamais utiliser le claim `role` dans `app_metadata` (réservé par GoTrue, casse l'auth). Le claim custom est `app_role`.

### Anti-pause (tier gratuit)

Maintenir le projet actif nécessite de contourner **deux limites indépendantes**, d'où deux workflows GitHub Actions :

1. **Pause Supabase** — le tier gratuit pause les projets après ~7 jours sans activité DB. [`.github/workflows/supabase-keepalive.yml`](.github/workflows/supabase-keepalive.yml) ping la base **quotidiennement** pour l'empêcher. Nécessite ces secrets dans Settings → Secrets and variables → Actions :
   - `SUPABASE_URL` (même valeur que `apps/cool-k9-back/.env`)
   - `SUPABASE_SERVICE_ROLE_KEY` (même valeur que `apps/cool-k9-back/.env`)

2. **Désactivation GitHub** — GitHub désactive tout workflow planifié (`schedule`) après 60 jours sans commit sur le repo. Sans push régulier, le ping ci-dessus finirait donc par s'arrêter. [`.github/workflows/repo-keepalive.yml`](.github/workflows/repo-keepalive.yml) committe un timestamp **une fois par mois** pour réinitialiser ce compteur (au bénéfice de tous les workflows).

> **Note** : `repo-keepalive.yml` pousse un commit sur `main` via `github-actions[bot]`. Si `main` est protégée par une branch protection, autoriser le bot à pusher (ou passer par un PAT), sinon le workflow échouera.

## Sécurité de l'API

Le backend applique les protections suivantes, configurées dans `main.ts` et `app.module.ts` :

| Protection                 | Comportement                                                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **CORS**                   | Seules les origines listées dans `CORS_ORIGINS` sont acceptées. Aucune origine n'est codée en dur.                               |
| **En-têtes HTTP**          | Helmet : `nosniff`, protection contre l'inclusion en cadre, suppression de `X-Powered-By`. HSTS activé uniquement en production. |
| **Limitation de débit**    | 100 requêtes/min par IP. `GET /api/users` est plafonné à 10/min (endpoint coûteux). `/api/health` en est exempté.                |
| **Validation des entrées** | Tout corps de requête est validé ; un champ inconnu ou mal typé renvoie `400` en nommant le champ.                               |
| **Configuration**          | Les variables d'environnement sont validées au démarrage ; le processus s'arrête avant d'écouter si l'une manque.                |

### Health check

```sh
curl http://localhost:3000/api/health
# {"status":"ok","dependencies":{"supabase":"ok"},"timestamp":"..."}
```

Endpoint public et exempté de la limitation, destiné au monitoring externe et à la plateforme d'hébergement. Il renvoie `503` si Supabase est injoignable, sans jamais exposer d'identifiant.

### Derrière un proxy

L'application fait confiance à un seul niveau de proxy (`trust proxy: 1`), ce qui permet à la limitation de débit de voir l'IP réelle du client plutôt que celle du proxy. À ajuster si la chaîne de proxys change.

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
│   │       │   │   ├── auth/                # Login, Register, AuthProvider, ProtectedRoute
│   │       │   │   ├── sessions/            # Séances (components, hooks, services, api, models, constants, utils)
│   │       │   │   ├── dogs/                # Chiens
│   │       │   │   ├── profile/             # Profil utilisateur
│   │       │   │   └── admin/               # Pages admin (Pricing…)
│   │       │   ├── layout/                  # Layout global, navigation
│   │       │   └── constants/               # Constantes globales (api.constants.ts…)
│   │       ├── components/ui/               # Composants shadcn/ui partagés
│   │       └── utils/                       # Fonctions pures partagées
│   └── cool-k9-back/                        # API NestJS
│       └── src/app/
│           ├── features/                    # Un module NestJS par feature
│           │   ├── sessions/
│           │   ├── dogs/
│           │   └── users/
│           ├── common/                      # Models partagés entre modules (authenticated-request.model.ts…)
│           ├── auth/                        # SupabaseAuthGuard, AdminGuard
│           ├── config/                      # Schéma des variables d'env, parsing des origines CORS
│           ├── health/                      # Endpoint /api/health (public, non limité)
│           └── supabase/                    # Client Supabase (service_role)
├── libs/
│   └── models/                              # Types partagés (@models)
├── supabase/
│   └── schema.sql                           # DDL des tables public.*
└── .github/workflows/
    ├── ci.yml
    ├── supabase-keepalive.yml               # Ping Supabase quotidien (anti-pause 7j)
    └── repo-keepalive.yml                   # Commit mensuel (anti-désactivation GitHub 60j)
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
