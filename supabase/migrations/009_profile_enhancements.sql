ALTER TABLE public.recruiter_profiles
ADD COLUMN IF NOT EXISTS sample_placements text;

ALTER TABLE public.recruiter_profiles
ADD COLUMN IF NOT EXISTS headline text;

-- Allow recruiters to update their own profile
DO $$ BEGIN
  CREATE POLICY recruiter_profiles_update ON public.recruiter_profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow recruiters to delete their own location rows (needed for market sync on profile edit)
DO $$ BEGIN
  CREATE POLICY recruiter_locations_delete ON public.recruiter_locations
    FOR DELETE USING (
      auth.uid() IN (
        SELECT user_id FROM public.recruiter_profiles WHERE id = recruiter_profile_id
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
