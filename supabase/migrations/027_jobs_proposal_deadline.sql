ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS proposal_deadline date;
