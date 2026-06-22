-- job_proposals table: lets recruiters propose on open_for_proposals jobs.
-- Run manually in Supabase SQL Editor (no transaction required).

-- =================================================================
-- TABLE
-- =================================================================
CREATE TABLE public.job_proposals (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                   uuid        NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  recruiter_id             uuid        NOT NULL REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,
  proposed_fee_percentage  integer     NOT NULL,
  pitch                    text        NOT NULL,
  relevant_experience      text,
  status                   text        NOT NULL DEFAULT 'submitted',
  submitted_at             timestamptz NOT NULL DEFAULT now(),
  responded_at             timestamptz,
  UNIQUE(job_id, recruiter_id)
);

ALTER TABLE public.job_proposals ADD CONSTRAINT job_proposals_fee_check
  CHECK (proposed_fee_percentage IN (6, 8, 10));

ALTER TABLE public.job_proposals ADD CONSTRAINT job_proposals_status_check
  CHECK (status = ANY (ARRAY['submitted', 'shortlisted', 'rejected', 'accepted', 'withdrawn']));

-- =================================================================
-- INDEXES
-- =================================================================
CREATE INDEX idx_jp_job_id       ON public.job_proposals(job_id);
CREATE INDEX idx_jp_recruiter_id ON public.job_proposals(recruiter_id);
CREATE INDEX idx_jp_status       ON public.job_proposals(status);

-- =================================================================
-- ROW LEVEL SECURITY
-- =================================================================
ALTER TABLE public.job_proposals ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------
-- SELECT: recruiter sees only their own proposals
-- ------------------------------------------------------------------
CREATE POLICY "jp_select_recruiter" ON public.job_proposals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_id AND rp.user_id = auth.uid()
    )
  );

-- SELECT: HM sees all proposals on jobs they own
-- Ownership is confirmed by joining through hiring_company_profiles.
CREATE POLICY "jp_select_hm" ON public.job_proposals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE j.id = job_id AND hcp.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------
-- INSERT: recruiter can only insert a proposal for their own profile
-- ------------------------------------------------------------------
CREATE POLICY "jp_insert_recruiter" ON public.job_proposals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_id AND rp.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------
-- UPDATE: recruiter can only set their own proposal's status to 'withdrawn'
--
-- USING  — which rows the recruiter can target (theirs only)
-- WITH CHECK — the final row state must have status = 'withdrawn'
-- This prevents changing any field to a non-withdrawn status and
-- prevents targeting other recruiters' proposals.
-- ------------------------------------------------------------------
CREATE POLICY "jp_update_recruiter_withdraw" ON public.job_proposals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_id AND rp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    status = 'withdrawn'
    AND EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_id AND rp.user_id = auth.uid()
    )
  );

-- UPDATE: HM can set proposal status to 'shortlisted' or 'rejected' on their jobs
--
-- USING  — which proposals the HM can target (on jobs they own)
-- WITH CHECK — final status must be shortlisted or rejected (not accepted,
--              not submitted, not withdrawn — those are Stage 4 / recruiter-only)
CREATE POLICY "jp_update_hm_respond" ON public.job_proposals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE j.id = job_id AND hcp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    status IN ('shortlisted', 'rejected')
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE j.id = job_id AND hcp.user_id = auth.uid()
    )
  );
