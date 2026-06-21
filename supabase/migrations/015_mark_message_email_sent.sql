-- Updates email_notification_sent on a single message row, gated on the
-- caller being the original sender. SECURITY DEFINER bypasses the missing
-- UPDATE policy; the WHERE clause is the sole access control.
-- Only this one column can be changed — the function body is the lock.
CREATE OR REPLACE FUNCTION public.mark_message_email_sent(p_message_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.messages
  SET    email_notification_sent = true
  WHERE  id             = p_message_id
  AND    sender_user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.mark_message_email_sent(uuid)
  TO authenticated;
