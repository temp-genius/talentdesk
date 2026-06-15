ALTER TABLE public.recruiter_profiles
  ADD COLUMN IF NOT EXISTS has_seen_approval_modal boolean NOT NULL DEFAULT false;
