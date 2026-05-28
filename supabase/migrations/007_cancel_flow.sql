-- SECURITY DEFINER RPCs for job cancellation — bypass RLS on jobs table
-- which recruiters cannot update directly.

CREATE OR REPLACE FUNCTION public.cancel_job_by_hm(p_assignment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_id uuid;
BEGIN
  -- Guard: caller must be the hiring manager for this assignment's job
  IF NOT EXISTS (
    SELECT 1
    FROM public.job_recruiter_assignments jra
    JOIN public.jobs j ON j.id = jra.job_id
    JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
    WHERE jra.id = p_assignment_id AND hcp.user_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  SELECT job_id INTO v_job_id
  FROM public.job_recruiter_assignments
  WHERE id = p_assignment_id;

  UPDATE public.job_recruiter_assignments
  SET status = 'cancelled'
  WHERE id = p_assignment_id;

  UPDATE public.jobs
  SET status = 'cancelled_by_hm'
  WHERE id = v_job_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_job_by_hm(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.withdraw_from_job(p_assignment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_id uuid;
BEGIN
  -- Guard: caller must be the recruiter on this assignment
  IF NOT EXISTS (
    SELECT 1
    FROM public.job_recruiter_assignments jra
    JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
    WHERE jra.id = p_assignment_id AND rp.user_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  SELECT job_id INTO v_job_id
  FROM public.job_recruiter_assignments
  WHERE id = p_assignment_id;

  UPDATE public.job_recruiter_assignments
  SET status = 'cancelled'
  WHERE id = p_assignment_id;

  UPDATE public.jobs
  SET status = 'cancelled_by_recruiter'
  WHERE id = v_job_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.withdraw_from_job(uuid) TO authenticated;
