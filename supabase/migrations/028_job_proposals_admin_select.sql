CREATE POLICY "jp_select_admin" ON public.job_proposals
  FOR SELECT USING (is_admin());
