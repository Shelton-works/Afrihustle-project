-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('student', 'company');

-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');

-- Create enum for hustle status
CREATE TYPE public.hustle_status AS ENUM ('open', 'closed', 'in_progress', 'completed');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create student_profiles table
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  university TEXT,
  major TEXT,
  graduation_year INTEGER,
  skills TEXT[],
  resume_url TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create company_profiles table
CREATE TABLE public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create hustles table
CREATE TABLE public.hustles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT,
  remote BOOLEAN DEFAULT FALSE,
  compensation_amount DECIMAL(10,2),
  compensation_type TEXT, -- 'fixed', 'hourly', 'commission'
  required_skills TEXT[],
  duration TEXT,
  status hustle_status DEFAULT 'open',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hustle_id UUID REFERENCES public.hustles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  cover_letter TEXT,
  status application_status DEFAULT 'pending',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hustle_id, student_id)
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create conversation_participants table
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create resume_analytics table
CREATE TABLE public.resume_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  viewed_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  view_duration INTEGER, -- in seconds
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hustles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles RLS Policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User roles RLS Policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Student profiles RLS Policies
CREATE POLICY "Anyone can view student profiles"
  ON public.student_profiles FOR SELECT
  USING (true);

CREATE POLICY "Students can update own profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.student_profiles WHERE id = student_profiles.id));

CREATE POLICY "Students can insert own profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Company profiles RLS Policies
CREATE POLICY "Anyone can view company profiles"
  ON public.company_profiles FOR SELECT
  USING (true);

CREATE POLICY "Companies can update own profile"
  ON public.company_profiles FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.company_profiles WHERE id = company_profiles.id));

CREATE POLICY "Companies can insert own profile"
  ON public.company_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Hustles RLS Policies
CREATE POLICY "Anyone can view open hustles"
  ON public.hustles FOR SELECT
  USING (true);

CREATE POLICY "Companies can insert hustles"
  ON public.hustles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_profiles
      WHERE id = hustles.company_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can update own hustles"
  ON public.hustles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_profiles
      WHERE id = hustles.company_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can delete own hustles"
  ON public.hustles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_profiles
      WHERE id = hustles.company_id
      AND user_id = auth.uid()
    )
  );

-- Applications RLS Policies
CREATE POLICY "Students can view own applications"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_profiles
      WHERE id = applications.student_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can view applications to their hustles"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hustles h
      JOIN public.company_profiles cp ON h.company_id = cp.id
      WHERE h.id = applications.hustle_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can create applications"
  ON public.applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.student_profiles
      WHERE id = applications.student_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can update applications to their hustles"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.hustles h
      JOIN public.company_profiles cp ON h.company_id = cp.id
      WHERE h.id = applications.hustle_id
      AND cp.user_id = auth.uid()
    )
  );

-- Conversations RLS Policies
CREATE POLICY "Participants can view conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (true);

-- Conversation participants RLS Policies
CREATE POLICY "Participants can view conversation participants"
  ON public.conversation_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add themselves to conversations"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Messages RLS Policies
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Resume analytics RLS Policies
CREATE POLICY "Students can view own resume analytics"
  ON public.resume_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_profiles
      WHERE id = resume_analytics.student_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert resume analytics"
  ON public.resume_analytics FOR INSERT
  WITH CHECK (true);

-- Payments RLS Policies
CREATE POLICY "Students can view own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.student_profiles sp ON a.student_id = sp.id
      WHERE a.id = payments.application_id
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can view payments for their hustles"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.hustles h ON a.hustle_id = h.id
      JOIN public.company_profiles cp ON h.company_id = cp.id
      WHERE a.id = payments.application_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.hustles h ON a.hustle_id = h.id
      JOIN public.company_profiles cp ON h.company_id = cp.id
      WHERE a.id = payments.application_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can update payments"
  ON public.payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.hustles h ON a.hustle_id = h.id
      JOIN public.company_profiles cp ON h.company_id = cp.id
      WHERE a.id = payments.application_id
      AND cp.user_id = auth.uid()
    )
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hustles_updated_at
  BEFORE UPDATE ON public.hustles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;