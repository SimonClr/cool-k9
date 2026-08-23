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
- **TanStack React Query** - Cache et synchronisation des données serveur (hooks des features)
- **sonner** - Notifications toast
- **axios** - Client HTTP
- **date-fns / react-day-picker** - Manipulation de dates et sélecteur de calendrier
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

- Node.js 20+ (requis par Nx 22 et Vite 7)
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
4. Coller le contenu de [`supabase/init.sql`](supabase/init.sql) dans le SQL Editor du projet et exécuter. Le fichier est rejouable : l'exécuter sur une base déjà provisionnée aligne son schéma sans détruire les données.
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
| **Limitation de débit**    | 100 requêtes/min par IP. Endpoints durcis : `GET /api/users` 10/min, `GET /api/users/me/export` et `DELETE /api/users/me` 3/min. `/api/health` en est exempté. |
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

## Conformité RGPD

Les obligations légales sont portées par la feature `legal/` côté front et par le module `users` côté back.

### Documents légaux

Trois pages publiques, accessibles sans compte depuis le footer :

| Document              | Route                  |
| --------------------- | ---------------------- |
| Politique de confidentialité | `/confidentialite`     |
| Conditions générales  | `/conditions-generales` |
| Mentions légales      | `/mentions-legales`    |

Les routes sont déclarées une seule fois dans `features/legal/constants/legal-routes.constants.ts`. Les informations
variables (hébergeur, éditeur, durée de conservation…) vivent dans `legal-info.constants.ts` ; celles qui ne sont pas
encore arbitrées s'affichent via `PendingInfo` plutôt que d'être inventées.

### Consentement à l'inscription

Le formulaire d'inscription exige une case cochée renvoyant vers les CGU et la politique de confidentialité. La preuve
du consentement est enregistrée dans `user_metadata` (`terms_accepted_at`, `terms_version`) — **jamais** dans
`app_metadata`, réservé par GoTrue. Versionner le consentement permet de distinguer celui donné à une révision
antérieure des documents.

### Droits des personnes

| Droit          | Endpoint                    | Limite  |
| -------------- | --------------------------- | ------- |
| Portabilité    | `GET /api/users/me/export`  | 3/min   |
| Effacement     | `DELETE /api/users/me`      | 3/min   |

Les deux routes déduisent l'identifiant du **token vérifié**, jamais de la requête : un appelant ne peut donc agir que
sur son propre compte. L'export agrège le compte, ses chiens et toutes les séances auxquelles il participe.

La suppression est irréversible et confirmée côté front par la saisie du mot `SUPPRIMER`. Elle traite les séances
avant de supprimer le compte, tant que l'identifiant résout encore : une séance partagée perd l'identifiant et
subsiste (elle documente aussi l'activité des autres participants), une séance dont le compte était le dernier
participant est supprimée. Les chiens partent ensuite par cascade.

### Durée de conservation

Les données vivent aussi longtemps que le compte et disparaissent lorsque l'utilisateur le supprime. Il n'existe ni
job de purge, ni logique d'expiration, ni `pg_cron` sur le projet : la politique de confidentialité annonce donc ce
que le code fait réellement, plutôt qu'une durée fixe qu'aucun traitement n'appliquerait.

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

### Build complet (libs + frontend + backend)

```sh
pnpm build
# ou
pnpm nx run-many -t build -p models cool-k9-front cool-k9-back
```

> Les libs se construisent avant les apps : le front et le back consomment `@models`.

## Qualité du code

### Formatage

```sh
pnpm format        # réécrit les fichiers
pnpm format:check  # vérifie sans écrire
```

### Lint et typage

Les trois projets exposent la cible `eslint:lint` (et non `lint`, qui n'existe que sur `models`) :

```sh
pnpm nx run-many -t eslint:lint            # ESLint sur front, back et models
pnpm nx run-many -t typecheck              # front et models uniquement
```

> `cool-k9-back` n'expose pas de cible `typecheck` : son typage est vérifié par `pnpm build:back`.

### Tests

**Aucun test n'est écrit à ce jour** et aucun n'est exécuté en CI. Seul `models` expose une cible `test`
(Vitest) ; `cool-k9-back` n'a pas de cible de test du tout et il n'existe pas de projet e2e. L'amorçage de
l'outillage et l'écriture de la suite font l'objet d'un change OpenSpec dédié (`testing-suite`).

### Intégration continue

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) s'exécute sur chaque push vers `main` et chaque pull request.
Il construit les libs, puis le front et le back en parallèle. **Il ne lance ni lint, ni typecheck, ni tests** — ces
vérifications restent à la main du développeur en local tant que la suite de tests n'existe pas.

Le build du front tourne avec des variables `VITE_*` factices : Vite les inline au moment du build, les vraies valeurs
appartiennent donc à la plateforme qui construit ce qui est livré. Le build échoue quand même si une variable manque.

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
│   │       │   │   ├── profile/             # Profil, export de données, suppression de compte
│   │       │   │   ├── legal/               # Pages légales (CGU, confidentialité, mentions)
│   │       │   │   └── admin/               # Pages admin (Pricing…)
│   │       │   ├── layout/                  # Layout global, navigation, ThemeProvider (thème clair/sombre)
│   │       │   └── constants/               # Constantes globales (api.constants.ts…)
│   │       ├── components/ui/               # Composants shadcn/ui partagés
│   │       └── utils/                       # Fonctions pures partagées
│   └── cool-k9-back/                        # API NestJS
│       └── src/app/
│           ├── features/                    # Un module NestJS par feature
│           │   ├── sessions/
│           │   ├── dogs/
│           │   └── users/                   # Profils, export RGPD, suppression de compte
│           ├── common/                      # Models partagés entre modules (authenticated-request.model.ts…)
│           ├── auth/                        # SupabaseAuthGuard, AdminGuard
│           ├── config/                      # Schéma des variables d'env, parsing des origines CORS
│           ├── health/                      # Endpoint /api/health (public, non limité)
│           └── supabase/                    # Client Supabase (service_role)
├── libs/
│   └── models/                              # Types partagés (@models)
├── supabase/
│   └── init.sql                             # Schéma Postgres complet (tables, RLS, rejouable)
└── .github/workflows/
    ├── ci.yml                               # Build des libs, du front et du back
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

Sur Nx 22, le générateur prend un **chemin positionnel** ; le flag `--project` n'existe plus.

```sh
pnpm nx g @nx/react:component apps/cool-k9-front/src/app/features/dogs/components/DogCard
```

### Créer une nouvelle bibliothèque

```sh
pnpm nx g @nx/react:lib libs/my-lib
```

> En cas de doute sur un flag, le vérifier avec `pnpm nx g <générateur> --help` plutôt que de le deviner.
