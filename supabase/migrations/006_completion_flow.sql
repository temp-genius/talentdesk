CREATE OR REPLACE FUNCTION public.complete_placement(p_offer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_assignment_id uuid;
  v_job_id uuid;
BEGIN
  SELECT o.job_recruiter_assignment_id, jra.job_id
  INTO v_assignment_id, v_job_id
  FROM public.offers o
  JOIN public.job_recruiter_assignments jra ON jra.id = o.job_recruiter_assignment_id
  WHERE o.id = p_offer_id;

  IF v_assignment_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Offer not found');
  END IF;

  UPDATE public.milestones
  SET status = 'released', released_at = now()
  WHERE job_recruiter_assignment_id = v_assignment_id
  AND milestone_number = 3;

  UPDATE public.job_recruiter_assignments
  SET status = 'completed', completed_at = now()
  WHERE id = v_assignment_id;

  UPDATE public.jobs
  SET status = 'completed'
  WHERE id = v_job_id;

  RETURN jsonb_build_object('success', true);
END;
$func$;

GRANT EXECUTE ON FUNCTION public.complete_placement(uuid) TO authenticated, anon;
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT UPDATE ON public.milestones TO authenticated;
GRANT UPDATE ON public.job_recruiter_assignments TO authenticated;
