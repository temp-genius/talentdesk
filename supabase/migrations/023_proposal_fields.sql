-- Stage A: expand job_proposals + proposal_track_record table
-- Run manually in Supabase SQL Editor.

-- =================================================================
-- Extend job_proposals with three new optional columns
-- =================================================================
ALTER TABLE public.job_proposals
  ADD COLUMN sourcing_strategy      text,
  ADD COLUMN tools_used             text,
  ADD COLUMN delivery_timeline_days integer;

ALTER TABLE public.job_proposals
  ADD CONSTRAINT job_proposals_delivery_timeline_check
    CHECK (delivery_timeline_days IS NULL OR delivery_timeline_days BETWEEN 1 AND 90);

-- =================================================================
-- TABLE: proposal_track_record
-- =================================================================
CREATE TABLE public.proposal_track_record (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id   uuid NOT NULL REFERENCES public.job_proposals(id) ON DELETE CASCADE,
  description   text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.proposal_track_record ADD CONSTRAINT track_record_description_length_check
  CHECK (char_length(description) BETWEEN 5 AND 300);

-- =================================================================
-- ROW LEVEL SECURITY
-- =================================================================
ALTER TABLE public.proposal_track_record ENABLE ROW LEVEL SECURITY;

-- Recruiter sees track records on their own proposals
CREATE POLICY "track_record_select_recruiter" ON public.proposal_track_record
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.job_proposals jp
            JOIN public.recruiter_profiles rp ON rp.id = jp.recruiter_id
            WHERE jp.id = proposal_id AND rp.user_id = auth.uid())
  );

-- HM sees track records on proposals for jobs they own
CREATE POLICY "track_record_select_hm" ON public.proposal_track_record
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.job_proposals jp
            JOIN public.jobs j ON j.id = jp.job_id
            JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
            WHERE jp.id = proposal_id AND hcp.user_id = auth.uid())
  );

-- Recruiter can only insert track records on their own proposals
CREATE POLICY "track_record_insert_recruiter" ON public.proposal_track_record
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.job_proposals jp
            JOIN public.recruiter_profiles rp ON rp.id = jp.recruiter_id
            WHERE jp.id = proposal_id AND rp.user_id = auth.uid())
  );

-- Recruiter can only delete track records on their own proposals
CREATE POLICY "track_record_delete_recruiter" ON public.proposal_track_record
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.job_proposals jp
            JOIN public.recruiter_profiles rp ON rp.id = jp.recruiter_id
            WHERE jp.id = proposal_id AND rp.user_id = auth.uid())
  );

GRANT SELECT, INSERT, DELETE ON public.proposal_track_record TO authenticated;
