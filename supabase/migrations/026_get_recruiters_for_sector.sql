-- Returns approved recruiters whose specialisms include the given sector,
-- along with their email and first_name for notification purposes.
-- SECURITY DEFINER bypasses RLS on public.users to retrieve email.
-- Access gate: caller must be authenticated (auth.uid() IS NOT NULL).
CREATE OR REPLACE FUNCTION public.get_recruiters_for_sector(p_sector text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT json_agg(
    json_build_object(
      'email',      u.email,
      'first_name', rp.first_name
    )
  )
  FROM (
    SELECT DISTINCT rp2.user_id, rp2.first_name
    FROM   recruiter_specialisms rs
    JOIN   specialism_categories sc ON sc.id = rs.specialism_category_id
    JOIN   recruiter_profiles rp2   ON rp2.id = rs.recruiter_profile_id
    WHERE  sc.sector = p_sector
    AND    rp2.status = 'approved'
  ) rp
  JOIN users u ON u.id = rp.user_id
  WHERE auth.uid() IS NOT NULL
$$;

GRANT EXECUTE ON FUNCTION public.get_recruiters_for_sector(text) TO authenticated;
