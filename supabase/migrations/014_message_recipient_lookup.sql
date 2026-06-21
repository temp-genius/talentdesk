-- Returns {email, user_type} for a message recipient, but ONLY when the
-- caller already has a message row connecting them to that recipient on
-- the given job. SECURITY DEFINER bypasses RLS on public.users; the
-- EXISTS check is the sole access gate — no relationship, no data returned.
CREATE OR REPLACE FUNCTION public.get_message_recipient_info(
  p_recipient_id uuid,
  p_job_id       uuid
)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT json_build_object(
    'email',     u.email,
    'user_type', u.user_type::text
  )
  FROM   public.users u
  WHERE  u.id = p_recipient_id
  AND    auth.uid() IS NOT NULL
  AND    EXISTS (
    SELECT 1
    FROM   public.messages m
    WHERE  m.job_id           = p_job_id
    AND  (
      (m.sender_user_id = auth.uid() AND m.recipient_user_id = p_recipient_id)
      OR
      (m.sender_user_id = p_recipient_id AND m.recipient_user_id = auth.uid())
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_message_recipient_info(uuid, uuid)
  TO authenticated;
