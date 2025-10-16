-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('beekeeper', 'landowner');

-- Create enum for land verification status
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'denied');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create land_listings table
CREATE TABLE public.land_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  flowers TEXT[] DEFAULT '{}',
  space_hectares DECIMAL(10, 2) NOT NULL,
  price_per_month DECIMAL(10, 2) NOT NULL,
  verification_status verification_status DEFAULT 'pending' NOT NULL,
  image_url TEXT,
  available_from DATE,
  available_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beekeeper_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  land_id UUID REFERENCES public.land_listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(beekeeper_id, land_id)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beekeeper_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  land_id UUID REFERENCES public.land_listings(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Land listings policies
CREATE POLICY "Anyone can view verified land listings"
  ON public.land_listings FOR SELECT
  USING (verification_status = 'verified' OR owner_id = auth.uid());

CREATE POLICY "Landowners can insert their own listings"
  ON public.land_listings FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Landowners can update their own listings"
  ON public.land_listings FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Landowners can delete their own listings"
  ON public.land_listings FOR DELETE
  USING (auth.uid() = owner_id);

-- Favorites policies
CREATE POLICY "Beekeepers can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = beekeeper_id);

CREATE POLICY "Beekeepers can insert their own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = beekeeper_id);

CREATE POLICY "Beekeepers can delete their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = beekeeper_id);

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = beekeeper_id OR auth.uid() IN (
    SELECT owner_id FROM public.land_listings WHERE id = land_id
  ));

CREATE POLICY "Beekeepers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = beekeeper_id);

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = beekeeper_id OR auth.uid() IN (
    SELECT owner_id FROM public.land_listings WHERE id = land_id
  ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.land_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    (NEW.raw_user_meta_data->>'role')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();