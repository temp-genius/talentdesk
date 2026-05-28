-- SECURITY DEFINER helper so a recruiter can fetch the hiring manager's email
-- for their own assignment without needing direct access to hiring_company_profiles
-- (which is restricted by RLS to the company owner and admins).
CREATE OR REPLACE FUNCTION public.get_hm_email_for_assignment(p_assignment_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  -- Guard: caller must be the recruiter on this assignment
  IF NOT EXISTS (
    SELECT 1
    FROM public.job_recruiter_assignments jra
    JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
    WHERE jra.id = p_assignment_id
      AND rp.user_id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  SELECT u.email INTO v_email
  FROM public.job_recruiter_assignments jra
  JOIN public.jobs                  j   ON j.id  = jra.job_id
  JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
  JOIN auth.users                   u   ON u.id  = hcp.user_id
  WHERE jra.id = p_assignment_id;

  RETURN v_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_hm_email_for_assignment(uuid) TO authenticated;
