-- Marks messages as read for the current user within a specific conversation.
-- SECURITY DEFINER bypasses the missing UPDATE policy on messages.
-- The WHERE clause is the sole access control: only the recipient can mark
-- their own received messages as read, scoped to the exact job+sender pair.
CREATE OR REPLACE FUNCTION public.mark_messages_read(
  p_job_id        uuid,
  p_other_user_id uuid
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.messages
  SET    read_at = now()
  WHERE  job_id            = p_job_id
  AND    recipient_user_id = auth.uid()
  AND    sender_user_id    = p_other_user_id
  AND    read_at IS NULL;
$$;

GRANT EXECUTE ON FUNCTION public.mark_messages_read(uuid, uuid)
  TO authenticated;
