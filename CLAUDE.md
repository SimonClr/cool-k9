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
- React Hook Form + Zod pour tous les formulaires (voir section [Formulaires](#formulaires))
- Supabase Auth : ne jamais utiliser le claim `role` dans `app_metadata` (réservé par GoTrue, casse l'auth). Pour des claims custom, préfixer (ex: `app_role`)

## Langue

Tout ce qui vit **dans le code** est en **anglais** : noms de variables, fonctions, types et fichiers, commentaires, messages de commit, et messages d'erreur techniques (`throw new Error(...)`, exceptions NestJS, erreurs de configuration ou de build).

```ts
// Hide trainer observations until the owner has submitted their own
throw new UnauthorizedException('Missing authorization token');
throw new Error('VITE_API_BASE_URL is not defined. Set it in the app .env file.');
```

Seuls les **textes affichés à l'utilisateur** restent en **français**, l'application s'adressant à un public francophone : libellés d'interface, messages de validation des schémas Zod, contenus des pages.

```ts
email: z.string().min(1, "L'email est obligatoire"),
<span className="sr-only">Chargement...</span>
```

Règle de tri : si un développeur est le seul à le lire, c'est en anglais ; si un utilisateur peut le voir, c'est en français.

## Architecture feature-based (frontend)

- `app/features/<feature>/` — tout ce qui appartient à une feature
- `app/layout/` — composants de navigation et layout global
- `app/constants/` — constantes globales (ex: `api.ts` pour `API_BASE_URL`)
- `app/utils/` — fonctions pures partagées par toute l'app
- `components/ui/` — composants shadcn/ui partagés
- Si un fichier n'est utilisé que par une seule feature, il vit dans cette feature

## Structure d'une feature (frontend)

```
features/<feature>/
  index.ts               ← API publique de la feature
  <Feature>.tsx          ← page(s) de la feature à la racine
  components/            ← sous-composants propres à la feature
  hooks/                 ← hooks React Query de la feature
  services/              ← logique métier sans state (mapping, transformation)
  api/                   ← appels réseau bruts (fetch)
  models/                ← types et interfaces (un fichier par notion)
  constants/             ← constantes propres à la feature
  utils/                 ← fonctions pures propres à la feature
```

## Architecture modulaire (backend NestJS)

- `app/features/<feature>/` — un module NestJS par feature métier
- `app/auth/` — module d'infrastructure pour l'authentification (guards)
- `app/supabase/` — module d'infrastructure pour l'accès à la base de données
- `app/config/` — schéma de validation des variables d'environnement, parsing des origines CORS
- `app/health/` — endpoint `/api/health` (public, exempté de la limitation de débit)
- `app.module.ts` importe uniquement les feature modules et les modules d'infrastructure

## Structure d'un module backend

```
features/<feature>/
  <feature>.module.ts    ← module NestJS (imports, controllers, providers)
  <feature>.controller.ts
  <feature>.service.ts
  dto/
    create-<feature>.dto.ts
    update-<feature>.dto.ts
```

## Sécurité backend

Un `ValidationPipe` global est actif avec `whitelist` et `forbidNonWhitelisted` : **tout champ non déclaré dans un DTO provoque un `400`**. Chaque propriété de DTO doit donc porter ses décorateurs `class-validator`, sinon elle sera rejetée même lorsqu'elle est légitime.

```ts
export class CreateDogDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsDateString()
  birthDate: string;
}
```

`@IsOptional()` ignore à la fois `undefined` et `null` : c'est ce qui permet au client d'effacer un champ en envoyant `null` (voir `UpdateSessionDto`).

Autres règles :

- **Variables d'environnement** : toute nouvelle variable requise doit être ajoutée au schéma Zod dans `app/config/env.schema.ts` et aux deux `.env.example`. L'application refuse de démarrer si l'une manque — ne jamais ajouter de valeur de repli.
- **Limitation de débit** : un seul profil est déclaré globalement. Pour durcir un endpoint coûteux, utiliser `@Throttle({ default: { ... } })` sur la route — la clé doit reprendre le nom du profil global, sinon la limite s'ajoute au lieu de remplacer. **Ne jamais déclarer un second profil dans `forRoot()`** : tout profil global s'applique à toutes les routes.
- **CORS** : les origines viennent de `CORS_ORIGINS`, jamais du code.

## Index files

- Toute feature expose une API publique via `index.ts` à la racine de son dossier
- Les dossiers partagés (`/components/ui/`, `/components/layout/`) ont aussi un `index.ts`
- Les imports entre features passent toujours par ces index, jamais directement dans les fichiers internes

## Composants

- Un composant = un fichier, une responsabilité unique
- Sous-composants regroupés dans le même dossier
- Pas de plusieurs composants exportés dans le même fichier

### forwardRef + useImperativeHandle

Utiliser ce pattern quand un parent doit orchestrer plusieurs sous-composants éditables (isDirty, canSave, save) sans remonter tout leur état.

L'interface `CardHandle` est définie dans `features/profile/models/profile.model.ts` :

```ts
export interface CardHandle {
  isDirty: boolean;
  canSave: boolean;
  save: () => Promise<void>;
}
```

**Sous-composant** :
```
export const DogsCard = forwardRef<CardHandle, { onDirtyChange?: () => void }>(
  function DogsCard({ onDirtyChange }, ref) {
    const isDirty = ...; // calculé depuis l'état local
    const canSave = ...; // calculé depuis l'état local

    useImperativeHandle(ref, () => ({ isDirty, canSave, save }), [isDirty, canSave]);
    useEffect(() => { onDirtyChange?.(); }, [isDirty]);
  }
);
```

**Parent orchestrateur** :
```
const profileRef = useRef<CardHandle>(null);
const [, forceUpdate] = useState(0);

const isDirty = profileRef.current?.isDirty ?? false;
const handleSave = async () => {
  if (profileRef.current?.isDirty) await profileRef.current.save();
};

<DogsCard ref={profileRef} onDirtyChange={() => forceUpdate(n => n + 1)} />
```

> Le `forceUpdate` est nécessaire : React ne re-rend pas sur mutation d'un ref. Le callback `onDirtyChange` déclenche le re-render pour relire `ref.current.isDirty`.

## Logique métier

- **Hooks** : calculs/transformations qui dépendent du state React → `hooks/` de la feature (ou `/hooks/` si partagé par 2+ features)
- **Services** : logique métier sans state (mapping, transformation) → `services/` de la feature
- **Api** : appels réseau bruts (fetch) → `api/` de la feature
- **Utils** : fonctions pures (pas de state) → `features/<feature>/utils/` si propres à une feature, `/utils/` si partagées par 2+ features, inline si usage unique
- **Constants** : constantes sans état → `features/<feature>/constants/` si propres à une feature, `app/constants/` si globales (variables en SCREAMING_SNAKE_CASE)

### Mapping enum → UI

Pour associer à chaque valeur d'enum un libellé et un variant de badge, utiliser la structure suivante (exemple dans `features/sessions/`) :

```
models/exercise.model.ts             ← interface ExerciseTypeData { label; variant }
constants/exercise-type.constants.ts ← Record<ExerciseType, ExerciseTypeData>
utils/exercise-type.utils.ts         ← getExerciseTypeData(type) avec fallback
```

```
// exercise.model.ts
export interface ExerciseTypeData {
  label: string;
  variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
}

// exercise-type.constants.ts
export const EXERCISE_TYPE_LABELS: Record<ExerciseType, ExerciseTypeData> = {
  [ExerciseType.INITIATION]: { label: 'Initiation', variant: 'success' },
  // ...
};

// exercise-type.utils.ts
export function getExerciseTypeData(type: ExerciseType): ExerciseTypeData {
  return EXERCISE_TYPE_LABELS[type] ?? { label: type, variant: 'default' };
}
```

Usage dans un composant :
```tsx
const { label, variant } = getExerciseTypeData(session.exerciseType);
<Badge variant={variant}>{label}</Badge>
```

## Conventions de nommage des fichiers

La convention s'applique **partout de façon homogène** : à la racine globale comme dans les sous-dossiers de features.

| Élément           | Convention            |
|-------------------|-----------------------|
| hook              | `useDog.ts`           |
| composant React   | `DogCard.tsx`         |
| service           | `dog.service.ts`      |
| api               | `dog.api.ts`          |
| model             | `dog.model.ts`        |
| constante         | `dog.constants.ts`    |
| utils             | `dog.utils.ts`        |
| store             | `dog.store.ts`        |
| test              | `dog.service.test.ts` |

Règle de tri : fichier de constantes pures → `.constants.ts`, fonctions pures → `.utils.ts`, types/interfaces → `.model.ts`. Plusieurs catégories dans un même fichier → séparer en plusieurs fichiers.

## Models

- Model utilisé dans une seule feature → `features/<feature>/models/` (un fichier par notion)
- Model utilisé dans 2+ features mais dont la source est claire → reste dans la feature d'origine, exposé via son `index.ts`
- Model vraiment transversal sans feature d'attache → `/models/`
- Ne jamais exporter un type depuis un composant pour le réutiliser ailleurs

## Styles

- Privilégier les utility classes Tailwind, éviter le CSS custom sauf cas justifié
- Ne jamais définir de couleurs inline (hex, rgb) dans les composants — utiliser les tokens Tailwind/shadcn (`text-destructive`, `bg-muted`, etc.)

## Formatage

- Toujours utiliser les utilitaires de `/src/utils/` — jamais de `toLocaleDateString`, `toFixed`, ou formatage inline dans les composants
- Dates globales : `formatDateShort()` depuis `src/utils/date-format.utils.ts`
- Infos spécifiques à une feature : créer un `.utils.ts` dans `features/<feature>/utils/` (ex : `dog-info-format.utils.ts` pour `formatDogAge`)

## Formulaires

Tous les formulaires utilisent **React Hook Form + Zod** via `@hookform/resolvers/zod`. Ne jamais créer de formulaire avec des `useState` individuels + validation manuelle.

### Structure

- Schema Zod dans `features/{feature}/models/{form}.schema.ts`
- Pas de hook dédié `useXxxForm` — `useForm` est appelé directement dans le composant formulaire
- Les messages d'erreur sont dans le schema Zod, pas dans les composants

### Pattern de base

**1. Schema**
```ts
export const loginSchema = z.object({
  email: z.string().min(1, "L'email est obligatoire"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;
```

**2. Formulaire**
```ts
const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '' },
});
```

**3. Input natif**
```tsx
<Input {...register('email')} />
```

**4. Composant contrôlé** (Select shadcn, MultiSelect, Calendar…)
```tsx
<Controller
  control={control}
  name="field"
  render={({ field }) => (
    <Select value={field.value} onValueChange={field.onChange} />
  )}
/>
```

**5. Erreur**
```tsx
{errors.email && <FieldError id="email-error" message={errors.email.message!} />}
```

### Règles

- Inputs natifs HTML : `{...register('field')}`
- Composants contrôlés (Select shadcn, MultiSelect, Calendar, LocationAutocomplete) : `Controller`
- `LocationAutocomplete` (`features/sessions/components/LocationAutocomplete.tsx`) a une signature `onChange` spécialisée :
  ```tsx
  <Controller
    control={control}
    name="location"
    render={({ field }) => (
      <LocationAutocomplete
        value={field.value?.name ?? ''}
        onChange={(coords, displayName) => field.onChange(coords ?? null)}
      />
    )}
  />
  ```
  > `onChange` reçoit `(LocationValue | null, displayName: string)`. Si l'utilisateur tape du texte libre sans sélectionner une suggestion, `coords` est `null`.
- Erreurs : composant partagé `FieldError` dans `components/ui/field-error.tsx`
- `isDirty` / `isValid` : utiliser `formState.isDirty` / `formState.isValid`, jamais calculé manuellement
- Liste dynamique : `useFieldArray`
- État UI pur (popover ouvert/fermé) : `useState` local dans le composant, jamais dans un hook ou dans RHF

**Double-ref** — pour combiner le ref RHF avec un `useRef` local (ex : focus enchaîné entre champs) :

```ts
const { ref: rhfRef, ...rest } = register('password');
```
```tsx
<Input
  {...rest}
  ref={e => {
    rhfRef(e);
    localRef.current = e;
  }}
/>
```
