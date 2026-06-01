-- Add Career DNA, capacity, employer, and photo columns to recruiter_profiles
ALTER TABLE public.recruiter_profiles
  ADD COLUMN IF NOT EXISTS career_dna             text CHECK (career_dna IN ('agency', 'inhouse', 'hybrid')),
  ADD COLUMN IF NOT EXISTS capacity_status        text NOT NULL DEFAULT 'open_to_new'
                                                  CHECK (capacity_status IN ('open_to_new', 'nearly_full', 'full')),
  ADD COLUMN IF NOT EXISTS previous_employers     text,
  ADD COLUMN IF NOT EXISTS previous_client_types  text[],
  ADD COLUMN IF NOT EXISTS last_placement_at      timestamptz;

-- Storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile-photos
DO $$ BEGIN
  CREATE POLICY "profile_photos_insert"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profile_photos_update"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profile_photos_public_read"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'profile-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trigger: update last_placement_at when an assignment is completed
CREATE OR REPLACE FUNCTION public.update_last_placement_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.recruiter_profiles
    SET last_placement_at = NOW()
    WHERE id = NEW.recruiter_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_last_placement_at ON public.job_recruiter_assignments;
CREATE TRIGGER trg_last_placement_at
  AFTER UPDATE ON public.job_recruiter_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_last_placement_at();
