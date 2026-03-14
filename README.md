# Cool K9 - Dog Trainer App

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

Application de gestion de séances d'éducation canine construite avec un monorepo Nx.

## Architecture du projet

Ce projet utilise [Nx](https://nx.dev) pour gérer un monorepo contenant :

- **cool-k9-front** : Application React frontend
- **cool-k9-back** : API NestJS backend
- **models** : Bibliothèque partagée de modèles TypeScript

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

### Shared
- **@dog-trainer/models** - Types et interfaces partagés entre frontend et backend

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
│   ├── cool-k9-front/          # Application React
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── components/  # Composants réutilisables
│   │   │   │   ├── pages/       # Pages de l'application
│   │   │   │   ├── services/    # Services API
│   │   │   │   └── utils/       # Utilitaires
│   │   │   ├── components/      # Composants UI shadcn
│   │   │   └── lib/             # Bibliothèques utilitaires
│   │   ├── tailwind.config.js
│   │   └── vite.config.mts
│   └── cool-k9-back/            # API NestJS
│       └── src/
├── libs/
│   └── models/                  # Types partagés
│       └── src/
│           └── lib/
│               └── models.ts
└── package.json
```

## Composants shadcn/ui disponibles

- **Card** - Cartes de contenu avec header, title, description, content et footer
- **Badge** - Badges avec variantes (default, secondary, destructive, outline, success, warning, info)
- **Button** - Boutons avec variantes (default, destructive, outline, secondary, ghost, link) et tailles

## Fonctionnalités

- Liste des séances d'éducation canine
- Affichage des détails de chaque séance (type d'exercice, chien, durée, notes)
- Page des tarifs
- Navigation responsive (desktop et mobile)
- Interface moderne avec Tailwind CSS et shadcn/ui

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

## Ressources utiles

### Nx
- [Documentation Nx](https://nx.dev)
- [Nx Console](https://nx.dev/getting-started/editor-setup) - Extension VSCode/IntelliJ

### React & Ecosystem
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [React Router](https://reactrouter.com)

### UI & Styling
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- [lucide-react Icons](https://lucide.dev)

### Backend
- [NestJS Documentation](https://docs.nestjs.com)

## Communauté Nx

- [Discord](https://go.nx.dev/community)
- [Twitter/X](https://twitter.com/nxdevtools)
- [LinkedIn](https://www.linkedin.com/company/nrwl)
- [YouTube](https://www.youtube.com/@nxdevtools)
- [Blog](https://nx.dev/blog)
