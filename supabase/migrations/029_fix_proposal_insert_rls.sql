DROP POLICY IF EXISTS "jp_insert_recruiter" ON public.job_proposals;

CREATE POLICY "jp_insert_recruiter" ON public.job_proposals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_id
        AND rp.user_id = auth.uid()
        AND rp.status = 'approved'
    )
  );
