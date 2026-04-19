-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'enseignant', 'etudiant');
CREATE TYPE public.note_type AS ENUM ('controle_continu', 'examen', 'tp', 'projet');
CREATE TYPE public.presence_statut AS ENUM ('present', 'absent', 'retard', 'justifie');
CREATE TYPE public.inscription_statut AS ENUM ('active', 'suspendue', 'terminee');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom TEXT NOT NULL DEFAULT '',
  nom TEXT NOT NULL DEFAULT '',
  cin TEXT,
  telephone TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer pour éviter récursion RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id ORDER BY 
    CASE role WHEN 'admin' THEN 1 WHEN 'enseignant' THEN 2 ELSE 3 END LIMIT 1
$$;

-- ============ FILIERES ============
CREATE TABLE public.filieres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  duree_annees INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.filieres ENABLE ROW LEVEL SECURITY;

-- ============ ETUDIANTS ============
CREATE TABLE public.etudiants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  matricule TEXT NOT NULL UNIQUE,
  filiere_id UUID REFERENCES public.filieres(id) ON DELETE SET NULL,
  niveau INTEGER NOT NULL DEFAULT 1,
  date_naissance DATE,
  date_inscription DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.etudiants ENABLE ROW LEVEL SECURITY;

-- ============ MODULES ============
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  coefficient NUMERIC(3,1) NOT NULL DEFAULT 1,
  semestre INTEGER NOT NULL DEFAULT 1,
  filiere_id UUID REFERENCES public.filieres(id) ON DELETE CASCADE,
  enseignant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- ============ INSCRIPTIONS ============
CREATE TABLE public.inscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etudiant_id UUID NOT NULL REFERENCES public.etudiants(id) ON DELETE CASCADE,
  annee_academique TEXT NOT NULL,
  statut inscription_statut NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(etudiant_id, annee_academique)
);
ALTER TABLE public.inscriptions ENABLE ROW LEVEL SECURITY;

-- ============ NOTES ============
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etudiant_id UUID NOT NULL REFERENCES public.etudiants(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  type note_type NOT NULL DEFAULT 'controle_continu',
  note NUMERIC(4,2) NOT NULL CHECK (note >= 0 AND note <= 20),
  date_evaluation DATE NOT NULL DEFAULT CURRENT_DATE,
  saisie_par UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  commentaire TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notes_etudiant ON public.notes(etudiant_id);
CREATE INDEX idx_notes_module ON public.notes(module_id);

-- ============ PRESENCES ============
CREATE TABLE public.presences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etudiant_id UUID NOT NULL REFERENCES public.etudiants(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  date_seance DATE NOT NULL DEFAULT CURRENT_DATE,
  statut presence_statut NOT NULL DEFAULT 'present',
  saisie_par UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  commentaire TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(etudiant_id, module_id, date_seance)
);
ALTER TABLE public.presences ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_presences_etudiant ON public.presences(etudiant_id);

-- ============ TRIGGER updated_at ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_filieres_updated BEFORE UPDATE ON public.filieres FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_etudiants_updated BEFORE UPDATE ON public.etudiants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_modules_updated BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_notes_updated BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUTO-CREATE PROFILE + ROLE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, prenom, nom)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', '')
  );

  -- admin@iteip.ma => admin auto
  IF NEW.email = 'admin@iteip.ma' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    -- rôle par défaut depuis metadata, sinon etudiant
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      NEW.id,
      COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'etudiant')
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RLS POLICIES ============

-- PROFILES
CREATE POLICY "Profiles viewable by self or admin" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'enseignant'));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin manage profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- USER_ROLES
CREATE POLICY "View own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- FILIERES (publiques en lecture)
CREATE POLICY "Filieres visible to all authenticated" ON public.filieres
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Filieres public read" ON public.filieres
  FOR SELECT TO anon USING (true);
CREATE POLICY "Admin manage filieres" ON public.filieres
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ETUDIANTS
CREATE POLICY "Etudiant view self, staff view all" ON public.etudiants
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'enseignant')
  );
CREATE POLICY "Admin manage etudiants" ON public.etudiants
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- MODULES
CREATE POLICY "Modules visible to authenticated" ON public.modules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage modules" ON public.modules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- INSCRIPTIONS
CREATE POLICY "View own inscriptions or staff" ON public.inscriptions
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'enseignant')
    OR EXISTS(SELECT 1 FROM public.etudiants e WHERE e.id = etudiant_id AND e.user_id = auth.uid())
  );
CREATE POLICY "Admin manage inscriptions" ON public.inscriptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- NOTES
CREATE POLICY "Etudiant view own notes" ON public.notes
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS(SELECT 1 FROM public.modules m WHERE m.id = module_id AND m.enseignant_id = auth.uid())
    OR EXISTS(SELECT 1 FROM public.etudiants e WHERE e.id = etudiant_id AND e.user_id = auth.uid())
  );
CREATE POLICY "Enseignant insert notes for own modules" ON public.notes
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS(SELECT 1 FROM public.modules m WHERE m.id = module_id AND m.enseignant_id = auth.uid())
  );
CREATE POLICY "Enseignant update notes for own modules" ON public.notes
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS(SELECT 1 FROM public.modules m WHERE m.id = module_id AND m.enseignant_id = auth.uid())
  );
CREATE POLICY "Admin delete notes" ON public.notes
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- PRESENCES
CREATE POLICY "View presences self or staff" ON public.presences
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS(SELECT 1 FROM public.modules m WHERE m.id = module_id AND m.enseignant_id = auth.uid())
    OR EXISTS(SELECT 1 FROM public.etudiants e WHERE e.id = etudiant_id AND e.user_id = auth.uid())
  );
CREATE POLICY "Enseignant insert presences" ON public.presences
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS(SELECT 1 FROM public.modules m WHERE m.id = module_id AND m.enseignant_id = auth.uid())
  );
CREATE POLICY "Enseignant update presences" ON public.presences
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS(SELECT 1 FROM public.modules m WHERE m.id = module_id AND m.enseignant_id = auth.uid())
  );
CREATE POLICY "Admin delete presences" ON public.presences
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ============ SEED FILIERES ITEIP ============
INSERT INTO public.filieres (nom, code, description, duree_annees) VALUES
('Développement Digital', 'DD', 'Formation en développement web et mobile', 2),
('Infrastructure Digitale', 'ID', 'Réseaux, systèmes et cybersécurité', 2),
('Gestion des Entreprises', 'GE', 'Management et administration', 2),
('Marketing Digital', 'MD', 'Stratégies marketing et communication digitale', 2);