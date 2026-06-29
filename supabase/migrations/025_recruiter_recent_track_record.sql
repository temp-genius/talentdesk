-- Add recent_track_record to recruiter_profiles.
-- Run manually in Supabase SQL Editor.

ALTER TABLE public.recruiter_profiles
  ADD COLUMN recent_track_record text;
