ALTER TABLE public.milestones
ADD COLUMN IF NOT EXISTS charge_amount decimal,
ADD COLUMN IF NOT EXISTS transfer_amount decimal,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
ADD COLUMN IF NOT EXISTS stripe_transfer_id text,
ADD COLUMN IF NOT EXISTS charge_status text DEFAULT 'pending'
  CHECK (charge_status IN ('pending', 'charged', 'failed')),
ADD COLUMN IF NOT EXISTS charge_triggered_at timestamptz,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_payment_method_id text;

ALTER TABLE public.recruiter_profiles
ADD COLUMN IF NOT EXISTS stripe_account_id text;

ALTER TABLE public.hiring_company_profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_payment_method_id text;

GRANT UPDATE ON public.milestones TO authenticated;
GRANT UPDATE ON public.recruiter_profiles TO authenticated;
GRANT UPDATE ON public.hiring_company_profiles TO authenticated;

-- Allow hiring managers to update their own company profile (Stripe details)
DO $$ BEGIN
  CREATE POLICY hiring_company_profiles_update ON public.hiring_company_profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
