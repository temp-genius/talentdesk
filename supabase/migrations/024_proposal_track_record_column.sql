-- Add track_record and screening_strategy directly on job_proposals.
-- proposal_track_record table remains in place but is no longer referenced by the app.
-- Run manually in Supabase SQL Editor.

ALTER TABLE public.job_proposals
  ADD COLUMN track_record       text,
  ADD COLUMN screening_strategy text;
