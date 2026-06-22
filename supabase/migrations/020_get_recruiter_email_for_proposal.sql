-- Returns the recruiter's email for a given proposal, but ONLY when the
-- caller is the hiring manager who owns the job the proposal is on.
-- SECURITY DEFINER bypasses RLS on public.users; the JOIN chain through
-- hiring_company_profiles is the sole access gate.
CREATE OR REPLACE FUNCTION public.get_recruiter_email_for_proposal(p_proposal_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT u.email
  FROM   public.users u
  JOIN   public.recruiter_profiles rp  ON rp.user_id  = u.id
  JOIN   public.job_proposals jp       ON jp.recruiter_id = rp.id
  JOIN   public.jobs j                 ON j.id         = jp.job_id
  JOIN   public.hiring_company_profiles hcp ON hcp.id  = j.hiring_company_id
  WHERE  jp.id          = p_proposal_id
  AND    hcp.user_id    = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_recruiter_email_for_proposal(uuid)
  TO authenticated;
