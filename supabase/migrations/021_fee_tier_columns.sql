-- Replace broken preferred_fee_percentage (decimal, comma-string mismatch)
-- with two clean integer columns representing the recruiter's permitted range.

ALTER TABLE public.recruiter_profiles
  DROP COLUMN preferred_fee_percentage;

ALTER TABLE public.recruiter_profiles
  ADD COLUMN fee_floor   integer,
  ADD COLUMN fee_ceiling integer;

ALTER TABLE public.recruiter_profiles
  ADD CONSTRAINT recruiter_profiles_fee_floor_check
    CHECK (fee_floor IN (6, 8, 10)),
  ADD CONSTRAINT recruiter_profiles_fee_ceiling_check
    CHECK (fee_ceiling IN (6, 8, 10)),
  ADD CONSTRAINT recruiter_profiles_fee_range_check
    CHECK (fee_floor <= fee_ceiling);
