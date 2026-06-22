-- Extend jp_update_hm_respond to allow HM to set proposal status to 'accepted'.
-- Only the WITH CHECK expression is changed; the USING clause (HM must own the job)
-- is left untouched by ALTER POLICY.
-- Run manually in Supabase SQL Editor.

ALTER POLICY "jp_update_hm_respond" ON public.job_proposals
  WITH CHECK (
    status IN ('shortlisted', 'rejected', 'accepted')
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE j.id = job_id AND hcp.user_id = auth.uid()
    )
  );
