-- Recruiter can trigger milestone review window (pending → review_window)
CREATE POLICY "ms_update_recruiter" ON public.milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
  );

-- HM can approve / release milestones on their jobs
CREATE POLICY "ms_update_hm" ON public.milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.jobs j ON j.id = jra.job_id
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE jra.id = job_recruiter_assignment_id AND hcp.user_id = auth.uid()
    )
  );

-- HM can update candidate interview_status on their jobs
CREATE POLICY "candp_update_hm" ON public.candidate_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.jobs j ON j.id = jra.job_id
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE jra.id = job_recruiter_assignment_id AND hcp.user_id = auth.uid()
    )
  );
