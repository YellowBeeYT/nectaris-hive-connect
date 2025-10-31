-- 1) Ensure enum type for roles exists with needed values
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('beekeeper', 'landowner');
  END IF;
END $$;

-- Ensure required enum values exist (safe if already present)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'beekeeper'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'beekeeper';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'landowner'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'landowner';
  END IF;
END $$;

-- 2) Create profiles table if it doesn't exist (aligned with current app expectations)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  role public.user_role NOT NULL,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Ensure role column type is correct if table already existed
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
      AND udt_name <> 'user_role'
  ) THEN
    ALTER TABLE public.profiles
      ALTER COLUMN role TYPE public.user_role USING role::text::public.user_role;
  END IF;
END $$;

-- 3) Enable RLS (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies (create only if they don't exist). Note: CREATE POLICY doesn't support IF NOT EXISTS; rely on existing ones from project.
-- Existing policies (from context): view: true, insert/update: auth.uid() = id
-- We won't duplicate them here to avoid errors.

-- 4) Ensure handle_new_user function exists and safely inserts profile with role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'beekeeper'::public.user_role)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 5) Create trigger on auth.users to populate profiles on signup (only if missing)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;
