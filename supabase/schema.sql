-- Schéma Postgres complet du projet Cool K9.
-- À coller dans le SQL Editor du dashboard Supabase pour initialiser un nouveau projet.

CREATE TABLE public.dogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  birth_date date NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sessions (
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

ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own dogs"
  ON public.dogs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users see only their sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = ANY (user_ids));
