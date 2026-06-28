-- Stage A: recruiter_niches table
CREATE TABLE public.recruiter_niches (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_profile_id  uuid NOT NULL REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,
  niche_text            text NOT NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE(recruiter_profile_id, niche_text)
);

ALTER TABLE public.recruiter_niches ADD CONSTRAINT recruiter_niches_text_length_check
  CHECK (char_length(niche_text) BETWEEN 2 AND 40);

ALTER TABLE public.recruiter_niches ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read all niches (needed for HM browse/search)
CREATE POLICY "niches_select" ON public.recruiter_niches
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- A recruiter can only insert their own niches
CREATE POLICY "niches_insert_own" ON public.recruiter_niches
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.recruiter_profiles rp
            WHERE rp.id = recruiter_profile_id AND rp.user_id = auth.uid())
  );

-- A recruiter can only delete their own niches
CREATE POLICY "niches_delete_own" ON public.recruiter_niches
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.recruiter_profiles rp
            WHERE rp.id = recruiter_profile_id AND rp.user_id = auth.uid())
  );

-- Explicit grant so the authenticated role can use the table
GRANT SELECT, INSERT, DELETE ON public.recruiter_niches TO authenticated;
