-- ============================================================================
-- Cool K9 — schéma Postgres complet
--
-- Ce fichier décrit l'état ATTENDU de la base. Il fait foi.
-- À coller dans le SQL Editor du dashboard Supabase pour initialiser un projet neuf.
--
-- Il est écrit pour être REJOUABLE : chaque objet est créé avec un garde
-- (IF NOT EXISTS / DROP … IF EXISTS / CREATE OR REPLACE). L'exécuter sur une base
-- déjà provisionnée aligne son schéma sans détruire les données.
--
-- Toute évolution du schéma se répercute ici. Pour faire évoluer une base
-- contenant déjà des données, voir la section « Reprise de données » en fin de
-- fichier : les instructions de transition ponctuelles y sont regroupées.
-- ============================================================================


-- ============================================================================
-- 1. Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  birth_date date NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date timestamptz NOT NULL,
  exercise_type text NOT NULL,
  duration integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  location text,
  environment text,
  weather text,
  route text,
  previous_objectives text,
  next_objectives text,
  owner_observations text,
  trainer_observations text,
  observation_status text,
  location_lat double precision,
  location_lon double precision,
  user_ids uuid[] NOT NULL DEFAULT '{}',
  dog_ids uuid[] NOT NULL DEFAULT '{}',
  dog_names text[] NOT NULL DEFAULT '{}'
);

-- Auteur de la saisie, pour la traçabilité (quel éducateur a créé la séance).
-- N'est PAS la règle d'autorisation : c'est le rôle qui gouverne l'écriture.
-- ON DELETE SET NULL — sans quoi la suppression d'un compte administrateur ayant
-- créé des séances échouerait.
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;


-- ============================================================================
-- 2. Rôle applicatif
-- ============================================================================

-- Le rôle est porté par le claim `app_metadata.app_role` du JWT, non modifiable
-- par le client — c'est ce qui le rend digne de confiance. La clé `role` est
-- réservée par GoTrue et ne doit jamais être utilisée.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT coalesce(auth.jwt() -> 'app_metadata' ->> 'app_role', '') = 'admin';
$$;


-- ============================================================================
-- 3. Row Level Security
--
-- Le backend utilise la clé service_role, qui contourne RLS par conception :
-- ces règles sont une défense en profondeur, pas l'autorisation de premier rang,
-- qui reste dans les gardes NestJS.
-- ============================================================================

ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Anciennes policies, remplacées par les règles granulaires ci-dessous.
DROP POLICY IF EXISTS "Users can manage their own dogs" ON public.dogs;
DROP POLICY IF EXISTS "Users see only their sessions" ON public.sessions;

-- --- dogs : le propriétaire gère ses chiens, l'administrateur a un accès étendu ---

DROP POLICY IF EXISTS "dogs_select" ON public.dogs;
CREATE POLICY "dogs_select"
  ON public.dogs FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "dogs_insert" ON public.dogs;
CREATE POLICY "dogs_insert"
  ON public.dogs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "dogs_update" ON public.dogs;
CREATE POLICY "dogs_update"
  ON public.dogs FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "dogs_delete" ON public.dogs;
CREATE POLICY "dogs_delete"
  ON public.dogs FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- --- sessions : lecture pour les participants, écriture réservée aux administrateurs ---

DROP POLICY IF EXISTS "sessions_select" ON public.sessions;
CREATE POLICY "sessions_select"
  ON public.sessions FOR SELECT
  USING (auth.uid() = ANY (user_ids) OR public.is_admin());

DROP POLICY IF EXISTS "sessions_insert" ON public.sessions;
CREATE POLICY "sessions_insert"
  ON public.sessions FOR INSERT
  WITH CHECK (public.is_admin());

-- Un participant peut renseigner ses observations sur une séance à laquelle il
-- participe. La restriction aux seuls champs d'observation est assurée par le
-- déclencheur ci-dessous : RLS ne sait pas limiter un UPDATE à un sous-ensemble
-- de colonnes.
DROP POLICY IF EXISTS "sessions_update" ON public.sessions;
CREATE POLICY "sessions_update"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = ANY (user_ids) OR public.is_admin())
  WITH CHECK (auth.uid() = ANY (user_ids) OR public.is_admin());

DROP POLICY IF EXISTS "sessions_delete" ON public.sessions;
CREATE POLICY "sessions_delete"
  ON public.sessions FOR DELETE
  USING (public.is_admin());


-- ============================================================================
-- 4. Protection de la composition d'une séance
--
-- Empêche un participant non administrateur de modifier la composition d'une
-- séance (date, participants, chiens) alors qu'il ne devrait toucher que ses
-- observations.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_session_update_scope()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  -- Le backend (clé service_role) contourne les policies, mais PAS les
  -- déclencheurs : il faut donc l'exempter explicitement, sinon ses propres
  -- écritures seraient bloquées. Une requête de service n'a pas de JWT
  -- utilisateur, d'où le test sur auth.uid() plutôt que sur le nom du rôle
  -- Postgres, qui varie selon la configuration du projet.
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.date IS DISTINCT FROM OLD.date
     OR NEW.user_ids IS DISTINCT FROM OLD.user_ids
     OR NEW.dog_ids IS DISTINCT FROM OLD.dog_ids
     OR NEW.dog_names IS DISTINCT FROM OLD.dog_names
     OR NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION
      'Seul un administrateur peut modifier la composition d''une séance (date, participants, chiens).';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sessions_enforce_update_scope ON public.sessions;
CREATE TRIGGER sessions_enforce_update_scope
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_session_update_scope();


-- ============================================================================
-- 5. Documentation des règles
-- ============================================================================

COMMENT ON COLUMN public.sessions.created_by IS
  'Auteur de la saisie (traçabilité). Renseigné par le backend depuis le jeton, jamais depuis le corps de la requête.';
COMMENT ON POLICY "sessions_select" ON public.sessions IS
  'Lecture réservée aux participants de la séance et aux administrateurs.';
COMMENT ON POLICY "sessions_insert" ON public.sessions IS
  'Création réservée aux administrateurs (éducateurs).';
COMMENT ON POLICY "sessions_update" ON public.sessions IS
  'Modification par les administrateurs, ou par un participant limité à ses observations (voir le déclencheur sessions_enforce_update_scope).';
COMMENT ON POLICY "sessions_delete" ON public.sessions IS
  'Suppression réservée aux administrateurs.';


-- ============================================================================
-- 6. Reprise de données  —  NE PAS EXÉCUTER AVEC LE RESTE DU FICHIER
--
-- Ce bloc renseigne `created_by` sur les séances antérieures à son introduction.
-- Il s'exécute SÉPARÉMENT et APRÈS le reste du fichier : la colonne doit exister
-- avant d'être mise à jour, sinon Postgres renvoie
-- « column "created_by" does not exist ».
--
-- Marche à suivre :
--   1. exécuter tout ce qui précède (sections 1 à 5) ;
--   2. copier le bloc ci-dessous dans une NOUVELLE requête, en le décommentant
--      ENTIÈREMENT, et en remplaçant l'adresse par celle du compte
--      administrateur à qui attribuer l'historique.
--
-- Ne pas utiliser `user_ids[1]` : le premier participant est généralement le
-- client, pas l'éducateur.
--
-- Sans objet sur une base neuve. Rejouable sans risque : la clause WHERE ne
-- touche que les lignes encore nulles.
-- ============================================================================

/*
UPDATE public.sessions
SET created_by = (SELECT id FROM auth.users WHERE email = 'admin@exemple.fr')
WHERE created_by IS NULL;

-- Contrôle : doit renvoyer 0.
SELECT count(*) FROM public.sessions WHERE created_by IS NULL;
*/
