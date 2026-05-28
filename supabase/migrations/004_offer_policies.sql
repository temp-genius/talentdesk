-- Hiring managers can insert offers for candidates on their jobs
CREATE POLICY "of_insert_hm" ON public.offers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.jobs j ON j.id = jra.job_id
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE jra.id = job_recruiter_assignment_id AND hcp.user_id = auth.uid()
    )
  );

-- =================================================================
-- Public offer acceptance via token — SECURITY DEFINER RPCs
-- These functions bypass RLS so the public acceptance page can
-- read and update offer records without an authenticated session.
-- The acceptance_token UUID acts as the secret credential.
-- =================================================================

-- Returns offer display data (anonymised: no company name)
CREATE OR REPLACE FUNCTION public.get_offer_by_token(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id',                o.id,
    'candidate_profile_id', o.candidate_profile_id,
    'agreed_salary',     o.agreed_salary,
    'currency',          o.currency,
    'start_date',        o.start_date,
    'acceptance_status', o.acceptance_status,
    'job_title',         j.title,
    'seniority_level',   j.seniority_level,
    'role_type',         j.role_type,
    'location_type',     j.location_type
  )
  INTO result
  FROM public.offers o
  JOIN public.job_recruiter_assignments jra ON jra.id = o.job_recruiter_assignment_id
  JOIN public.jobs j ON j.id = jra.job_id
  WHERE o.acceptance_token = p_token;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_offer_by_token(uuid) TO anon, authenticated;

-- Accepts or declines an offer by token; updates candidate_profiles too
CREATE OR REPLACE FUNCTION public.respond_to_offer(
  p_token  uuid,
  p_status text,
  p_ip     text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offer_id     uuid;
  v_candidate_id uuid;
BEGIN
  IF p_status NOT IN ('accepted', 'declined') THEN
    RETURN jsonb_build_object('error', 'Invalid status. Must be accepted or declined.');
  END IF;

  SELECT id, candidate_profile_id
    INTO v_offer_id, v_candidate_id
    FROM public.offers
   WHERE acceptance_token = p_token
     AND acceptance_status = 'pending';

  IF v_offer_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Offer not found or already responded to.');
  END IF;

  UPDATE public.offers
     SET acceptance_status       = p_status,
         accepted_at             = CASE WHEN p_status = 'accepted' THEN now() ELSE NULL END,
         accept_click_ip_address = p_ip
   WHERE id = v_offer_id;

  UPDATE public.candidate_profiles
     SET interview_status = CASE WHEN p_status = 'accepted' THEN 'accepted' ELSE 'declined' END
   WHERE id = v_candidate_id;

  RETURN jsonb_build_object('success', true, 'status', p_status);
END;
$$;

GRANT EXECUTE ON FUNCTION public.respond_to_offer(uuid, text, text) TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.offers TO authenticated;
GRANT SELECT ON public.offers TO anon;
