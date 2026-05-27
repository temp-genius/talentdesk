-- Allow hiring managers to create assignments for their own jobs
-- (previously only admins could insert; this enables the Start Job flow)
CREATE POLICY "jra_insert_hm" ON public.job_recruiter_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE j.id = job_id AND hcp.user_id = auth.uid()
    )
  );

-- Allow hiring managers to insert milestones for assignments on their own jobs
CREATE POLICY "ms_insert_hm" ON public.milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.jobs j ON j.id = jra.job_id
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE jra.id = job_recruiter_assignment_id AND hcp.user_id = auth.uid()
    )
  );
