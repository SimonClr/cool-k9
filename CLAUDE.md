<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# Directives générales pour Nx

- Pour explorer le workspace, invoquer le skill `nx-workspace` en premier — il contient les patterns pour interroger les projets, targets et dépendances
- Pour exécuter des tâches (build, lint, test, e2e…), toujours passer par `nx` (`nx run`, `nx run-many`, `nx affected`) plutôt qu'utiliser les outils sous-jacents directement
- Préfixer les commandes nx avec le gestionnaire de paquets du workspace (ex: `pnpm nx build`, `npm exec nx test`)
- Les outils MCP du serveur Nx sont disponibles, les utiliser
- Pour les bonnes pratiques d'un plugin Nx, consulter `node_modules/@nx/<plugin>/PLUGIN.md` si le fichier existe
- Ne jamais deviner les flags CLI — toujours vérifier avec `nx_docs` ou `--help`

## Scaffolding & Générateurs

- Pour les tâches de scaffolding (créer des apps, libs, structure de projet), toujours invoquer le skill `nx-generate` EN PREMIER avant d'explorer ou d'appeler des outils MCP

# Conventions du projet

## Stack technique

- React 19 avec TypeScript : hooks, functional components et conventions modernes ([doc](https://react.dev/))
- Tailwind CSS v4 avec utility classes pour le styling ([doc](https://tailwindcss.com/))
- shadcn/ui pour les composants UI ([doc](https://ui.shadcn.com/)) — importer depuis `@/components/ui` et utiliser l'utilitaire `cn()` pour merger les classes

## Architecture feature-based

- `/features/<feature>/` — tout ce qui appartient à une feature : pages, composants, hooks, services, api, store, types, utils
- `/components/ui/` — composants UI partagés par 2+ features
- `/components/layout/` — infrastructure de navigation et layout
- `/providers/` — providers React app-level montés une seule fois
- `/hooks/` — hooks partagés par 2+ features
- `/constants/` — constantes globales et configuration runtime
- `/utils/` (racine) — fonctions pures partagées par toute l'app
- Si un fichier n'est utilisé que par une seule feature, il vit dans cette feature — rien de feature-spécifique à la racine

## Structure d'une feature

```
features/<feature>/
  index.ts               ← API publique de la feature
  <Feature>.tsx          ← composant principal
  components/            ← composants propres à la feature
  hooks/                 ← hooks propres à la feature
  services/              ← logique métier (appels API transformés)
  api/                   ← appels réseau bruts
  store/                 ← store de la feature
  types/                 ← types propres à la feature (un fichier par notion)
  utils/                 ← fonctions pures propres à la feature
```

## Index files

- Toute feature expose une API publique via `index.ts` à la racine de son dossier
- Les dossiers partagés (`/components/ui/`, `/components/layout/`) ont aussi un `index.ts`
- Les imports entre features passent toujours par ces index, jamais directement dans les fichiers internes

## Composants

- Un composant = un fichier, une responsabilité unique
- Sous-composants regroupés dans le même dossier
- Pas de plusieurs composants exportés dans le même fichier

## Logique métier

- **Hooks** : calculs/transformations qui dépendent du state React → `hooks/` de la feature (ou `/hooks/` si partagé par 2+ features)
- **Services** : logique métier sans state → `services/` de la feature
- **Api** : appels réseau bruts → `api/` de la feature
- **Utils** : fonctions pures (pas de state) → `features/<feature>/utils/` si propres à une feature, `/utils/` si partagées par 2+ features, inline si usage unique
- **Constants** : constantes globales partagées → `/constants/` (variables en SCREAMING_SNAKE_CASE, fichiers en camelCase) — si une constante n'est utilisée que dans un seul fichier, elle est définie directement dans ce fichier

## Types

- Type utilisé dans une seule feature → `features/<feature>/types/` (un fichier par notion)
- Type utilisé dans 2+ features mais dont la source est claire → reste dans la feature d'origine, exposé via son `index.ts`
- Type vraiment transversal sans feature d'attache → `/types/`
- Ne jamais exporter un type depuis un composant pour le réutiliser ailleurs

## Styles

- Couleurs et thème centralisés dans `/constants/theme.ts`
- Ne jamais redéfinir localement une couleur déjà définie dans le thème
- Privilégier les utility classes Tailwind, éviter le CSS custom sauf cas justifié

## Formatage

- Toujours utiliser les utilitaires de `/utils/formatters.ts` — jamais de `toLocaleDateString`, `toFixed`, ou formatage inline dans les composants
