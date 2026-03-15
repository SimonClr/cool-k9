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

## Installation

```sh
pnpm install
```

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

```
dog-trainer/
├── apps/
│   ├── cool-k9-front/               # Application React
│   │   └── src/
│   │       ├── app/
│   │       │   ├── components/      # Composants réutilisables (Layout, RequiresDog…)
│   │       │   ├── hooks/           # Hooks TanStack Query (useDogs, useSessions)
│   │       │   ├── pages/
│   │       │   │   ├── dogs/        # Liste et ajout de chiens
│   │       │   │   ├── login/
│   │       │   │   ├── register/
│   │       │   │   ├── pricing/
│   │       │   │   └── sessions-list/
│   │       │   └── services/        # Appels API (DogService, SessionService)
│   │       └── components/          # Composants UI shadcn
│   └── cool-k9-back/                # API NestJS
│       └── src/app/
│           ├── auth/                # Guard Supabase
│           ├── dog/                 # Controller + Service chiens
│           ├── session/             # Controller + Service séances
│           └── supabase/            # Client Supabase
├── libs/
│   ├── models/                      # Types partagés (@models)
│   └── authentication/              # Auth Supabase (@authentication)
└── package.json
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

