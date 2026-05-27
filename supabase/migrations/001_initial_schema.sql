-- =================================================================
-- TalentDesk — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- =================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =================================================================
-- ENUM TYPES
-- =================================================================

CREATE TYPE user_type_enum AS ENUM (
  'recruiter', 'hiring_manager', 'admin'
);

CREATE TYPE user_status_enum AS ENUM (
  'active', 'suspended', 'pending'
);

CREATE TYPE recruiter_profile_status_enum AS ENUM (
  'pending', 'approved', 'rejected', 'suspended'
);

CREATE TYPE linkedin_network_size_tier_enum AS ENUM (
  'small', 'medium', 'large', 'xlarge'
);

CREATE TYPE availability_status_enum AS ENUM (
  'available', 'limited', 'unavailable'
);

CREATE TYPE trust_tier_enum AS ENUM (
  'new', 'established', 'trusted'
);

CREATE TYPE location_type_enum AS ENUM (
  'remote', 'hybrid', 'onsite'
);

CREATE TYPE seniority_level_enum AS ENUM (
  'junior', 'mid', 'senior', 'director', 'c_suite'
);

CREATE TYPE role_type_enum AS ENUM (
  'permanent', 'contract'
);

CREATE TYPE job_status_enum AS ENUM (
  'draft', 'active', 'cvs_submitted', 'interviews_scheduled',
  'offer_made', 'completed', 'cancelled_by_hm', 'cancelled_by_recruiter',
  'mutually_closed', 'disputed', 'reassigned'
);

CREATE TYPE assignment_status_enum AS ENUM (
  'assigned', 'completed', 'cancelled'
);

CREATE TYPE milestone_status_enum AS ENUM (
  'pending', 'review_window', 'approved', 'released', 'disputed'
);

-- Used on candidate_profiles.interview_status
CREATE TYPE candidate_interview_status_enum AS ENUM (
  'none', 'selected', 'scheduled', 'completed', 'offer_made', 'accepted', 'declined'
);

CREATE TYPE cv_confirmation_status_enum AS ENUM (
  'pending', 'confirmed', 'auto_confirmed', 'disputed'
);

-- Used on interviews.status
CREATE TYPE interview_record_status_enum AS ENUM (
  'scheduled', 'confirmed', 'completed', 'cancelled'
);

CREATE TYPE offer_acceptance_status_enum AS ENUM (
  'pending', 'accepted', 'declined', 'withdrawn', 'hm_confirmed'
);

CREATE TYPE payment_status_enum AS ENUM (
  'held', 'pending_transfer', 'transferred', 'refunded', 'disputed', 'failed'
);

CREATE TYPE dispute_outcome_enum AS ENUM (
  'release_to_recruiter', 'refund_to_hm', 'partial_split', 'dismissed'
);

CREATE TYPE dispute_status_enum AS ENUM (
  'direct_resolution', 'formal_raised', 'under_review', 'resolved'
);

CREATE TYPE reviewer_type_enum AS ENUM (
  'hiring_manager', 'candidate'
);

CREATE TYPE notification_status_enum AS ENUM (
  'sent', 'delivered', 'opened', 'failed'
);

CREATE TYPE vetting_status_enum AS ENUM (
  'pending', 'approved', 'rejected'
);

-- =================================================================
-- HELPER FUNCTION
-- Runs as the function owner (SECURITY DEFINER) so it can read
-- the users table even when RLS is active on it.
-- =================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND user_type = 'admin'
  );
$$;

-- =================================================================
-- TABLES
-- =================================================================

-- ------------------------------------------------------------------
-- 1. users
-- ------------------------------------------------------------------
CREATE TABLE public.users (
  id             uuid             PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email          text             NOT NULL UNIQUE,
  user_type      user_type_enum   NOT NULL,
  email_verified boolean          NOT NULL DEFAULT false,
  status         user_status_enum NOT NULL DEFAULT 'pending',
  created_at     timestamptz      NOT NULL DEFAULT now(),
  updated_at     timestamptz      NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 2. recruiter_profiles
-- ------------------------------------------------------------------
CREATE TABLE public.recruiter_profiles (
  id                          uuid                            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid                            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  first_name                  text,
  last_name                   text,
  linkedin_url                text,
  profile_photo_url           text,
  bio                         text,
  years_experience            integer,
  average_days_to_shortlist   decimal,
  total_placements            integer                         NOT NULL DEFAULT 0,
  status                      recruiter_profile_status_enum   NOT NULL DEFAULT 'pending',
  approval_notes              text,
  linkedin_network_size_tier  linkedin_network_size_tier_enum,
  response_time_average       decimal,
  availability_status         availability_status_enum        NOT NULL DEFAULT 'available',
  preferred_fee_percentage    decimal,
  relevance_score_cache       decimal                         NOT NULL DEFAULT 0,
  last_active_at              timestamptz,
  created_at                  timestamptz                     NOT NULL DEFAULT now(),
  updated_at                  timestamptz                     NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 3. recruiter_sectors
-- ------------------------------------------------------------------
CREATE TABLE public.recruiter_sectors (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_profile_id uuid        NOT NULL REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,
  sector_name          text        NOT NULL,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 4. recruiter_locations
-- ------------------------------------------------------------------
CREATE TABLE public.recruiter_locations (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_profile_id uuid        NOT NULL REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,
  country              text        NOT NULL,
  region               text,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 5. recruiter_tools
-- ------------------------------------------------------------------
CREATE TABLE public.recruiter_tools (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_profile_id uuid        NOT NULL REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,
  tool_name            text        NOT NULL,
  verified             boolean     NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 6. hiring_company_profiles
-- ------------------------------------------------------------------
CREATE TABLE public.hiring_company_profiles (
  id                 uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name       text            NOT NULL,
  company_domain     text,
  website            text,
  industry           text,
  company_size       text,
  country            text,
  trust_tier         trust_tier_enum NOT NULL DEFAULT 'new',
  stripe_customer_id text,
  created_at         timestamptz     NOT NULL DEFAULT now(),
  updated_at         timestamptz     NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 7. blocked_email_domains
-- ------------------------------------------------------------------
CREATE TABLE public.blocked_email_domains (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  domain     text        NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 8. whitelisted_domains
-- ------------------------------------------------------------------
CREATE TABLE public.whitelisted_domains (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text,
  company_name text,
  website      text,
  verified_by  uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  verified_at  timestamptz,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 9. jobs
-- ------------------------------------------------------------------
CREATE TABLE public.jobs (
  id                    uuid                 PRIMARY KEY DEFAULT gen_random_uuid(),
  hiring_company_id     uuid                 NOT NULL REFERENCES public.hiring_company_profiles(id) ON DELETE CASCADE,
  title                 text                 NOT NULL,
  sector                text,
  location_country      text,
  location_city         text,
  location_type         location_type_enum,
  salary_min            decimal,
  salary_max            decimal,
  currency              text                 NOT NULL DEFAULT 'EUR',
  seniority_level       seniority_level_enum,
  role_type             role_type_enum,
  description           text,
  status                job_status_enum      NOT NULL DEFAULT 'draft',
  anonymous             boolean              NOT NULL DEFAULT true,
  agreed_shortlist_size integer              NOT NULL DEFAULT 5,
  created_at            timestamptz          NOT NULL DEFAULT now(),
  updated_at            timestamptz          NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 10. job_recruiter_assignments
-- ------------------------------------------------------------------
CREATE TABLE public.job_recruiter_assignments (
  id           uuid                   PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       uuid                   NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  recruiter_id uuid                   NOT NULL REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,
  status       assignment_status_enum NOT NULL DEFAULT 'assigned',
  assigned_at  timestamptz            NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- ------------------------------------------------------------------
-- 11. milestones
-- ------------------------------------------------------------------
CREATE TABLE public.milestones (
  id                          uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  job_recruiter_assignment_id uuid                  NOT NULL REFERENCES public.job_recruiter_assignments(id) ON DELETE CASCADE,
  milestone_number            integer               NOT NULL CHECK (milestone_number BETWEEN 1 AND 3),
  milestone_name              text                  NOT NULL,
  amount                      decimal               NOT NULL,
  currency                    text                  NOT NULL DEFAULT 'EUR',
  platform_fee_amount         decimal,
  net_recruiter_amount        decimal,
  status                      milestone_status_enum NOT NULL DEFAULT 'pending',
  triggered_at                timestamptz,
  review_window_expires_at    timestamptz,
  released_at                 timestamptz,
  created_at                  timestamptz           NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 12. candidate_profiles
-- ------------------------------------------------------------------
CREATE TABLE public.candidate_profiles (
  id                          uuid                            PRIMARY KEY DEFAULT gen_random_uuid(),
  job_recruiter_assignment_id uuid                            NOT NULL REFERENCES public.job_recruiter_assignments(id) ON DELETE CASCADE,
  candidate_first_name        text,
  candidate_last_name         text,
  candidate_email             text,
  current_job_title           text,
  recruiter_notes             text,
  logged_at                   timestamptz,
  interview_status            candidate_interview_status_enum NOT NULL DEFAULT 'none',
  created_at                  timestamptz                     NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 13. cv_submissions
-- ------------------------------------------------------------------
CREATE TABLE public.cv_submissions (
  id                          uuid                        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_recruiter_assignment_id uuid                        NOT NULL REFERENCES public.job_recruiter_assignments(id) ON DELETE CASCADE,
  milestone_id                uuid                        REFERENCES public.milestones(id) ON DELETE SET NULL,
  submitted_at                timestamptz,
  notification_sent_at        timestamptz,
  notification_opened_at      timestamptz,
  notification_clicked_at     timestamptz,
  confirmation_status         cv_confirmation_status_enum NOT NULL DEFAULT 'pending',
  confirmed_at                timestamptz,
  number_of_candidates_logged integer,
  review_window_expires_at    timestamptz,
  milestone_triggered_at      timestamptz
);

-- ------------------------------------------------------------------
-- 14. interviews
-- ------------------------------------------------------------------
CREATE TABLE public.interviews (
  id                          uuid                         PRIMARY KEY DEFAULT gen_random_uuid(),
  job_recruiter_assignment_id uuid                         NOT NULL REFERENCES public.job_recruiter_assignments(id) ON DELETE CASCADE,
  candidate_profile_id        uuid                         NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  interview_date              date,
  interview_time              time,
  status                      interview_record_status_enum NOT NULL DEFAULT 'scheduled',
  confirmed_by_hiring_manager boolean                      NOT NULL DEFAULT false,
  confirmed_at                timestamptz,
  created_at                  timestamptz                  NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 15. offers
-- ------------------------------------------------------------------
CREATE TABLE public.offers (
  id                                uuid                         PRIMARY KEY DEFAULT gen_random_uuid(),
  job_recruiter_assignment_id       uuid                         NOT NULL REFERENCES public.job_recruiter_assignments(id) ON DELETE CASCADE,
  candidate_profile_id              uuid                         NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  candidate_email                   text,
  agreed_salary                     decimal,
  currency                          text                         NOT NULL DEFAULT 'EUR',
  start_date                        date,
  offer_logged_at                   timestamptz,
  offer_email_delay_expires_at      timestamptz,
  offer_email_sent_at               timestamptz,
  acceptance_token                  uuid                         NOT NULL DEFAULT gen_random_uuid(),
  acceptance_status                 offer_acceptance_status_enum NOT NULL DEFAULT 'pending',
  accepted_at                       timestamptz,
  hm_confirmed_at                   timestamptz,
  hm_confirmation_checkbox_accepted boolean                      NOT NULL DEFAULT false,
  accept_click_ip_address           text,
  accept_click_device_fingerprint   text,
  fraud_flag                        boolean                      NOT NULL DEFAULT false,
  fraud_flag_reason                 text,
  reminder_sent_at                  timestamptz,
  created_at                        timestamptz                  NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 16. messages
-- ------------------------------------------------------------------
CREATE TABLE public.messages (
  id                            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                        uuid        NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  sender_user_id                uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_user_id             uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message_body                  text        NOT NULL,
  sent_at                       timestamptz NOT NULL DEFAULT now(),
  read_at                       timestamptz,
  email_notification_sent       boolean     NOT NULL DEFAULT false,
  contains_contact_details_flag boolean     NOT NULL DEFAULT false,
  created_at                    timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 17. payments
-- ------------------------------------------------------------------
CREATE TABLE public.payments (
  id                          uuid                PRIMARY KEY DEFAULT gen_random_uuid(),
  job_recruiter_assignment_id uuid                NOT NULL REFERENCES public.job_recruiter_assignments(id) ON DELETE CASCADE,
  milestone_id                uuid                REFERENCES public.milestones(id) ON DELETE SET NULL,
  stripe_payment_intent_id    text,
  stripe_transfer_id          text,
  stripe_refund_id            text,
  gross_amount                decimal             NOT NULL,
  platform_fee_amount         decimal,
  stripe_fee_amount           decimal,
  net_recruiter_amount        decimal,
  currency                    text                NOT NULL DEFAULT 'EUR',
  exchange_rate_applied       decimal             NOT NULL DEFAULT 1,
  status                      payment_status_enum NOT NULL DEFAULT 'held',
  created_at                  timestamptz         NOT NULL DEFAULT now(),
  released_at                 timestamptz,
  transferred_at              timestamptz
);

-- ------------------------------------------------------------------
-- 18. disputes
-- ------------------------------------------------------------------
CREATE TABLE public.disputes (
  id                           uuid                 PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id                 uuid                 REFERENCES public.milestones(id) ON DELETE SET NULL,
  job_recruiter_assignment_id  uuid                 NOT NULL REFERENCES public.job_recruiter_assignments(id) ON DELETE CASCADE,
  raised_by_user_id            uuid                 NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  raised_against_user_id       uuid                 NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  dispute_reason               text,
  tier                         integer              NOT NULL DEFAULT 1,
  direct_resolution_attempted  boolean              NOT NULL DEFAULT false,
  direct_resolution_deadline   timestamptz,
  formal_dispute_raised_at     timestamptz,
  hm_evidence_text             text,
  recruiter_evidence_text      text,
  platform_records_attached    boolean              NOT NULL DEFAULT false,
  adjudicator_notes            text,
  outcome                      dispute_outcome_enum,
  outcome_amount_if_partial    decimal,
  status                       dispute_status_enum  NOT NULL DEFAULT 'direct_resolution',
  created_at                   timestamptz          NOT NULL DEFAULT now(),
  updated_at                   timestamptz          NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 19. reviews
-- ------------------------------------------------------------------
CREATE TABLE public.reviews (
  id                           uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  job_recruiter_assignment_id  uuid               NOT NULL REFERENCES public.job_recruiter_assignments(id) ON DELETE CASCADE,
  reviewer_user_id             uuid               NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reviewer_type                reviewer_type_enum NOT NULL,
  speed_rating                 integer            CHECK (speed_rating BETWEEN 1 AND 5),
  quality_rating               integer            CHECK (quality_rating BETWEEN 1 AND 5),
  communication_rating         integer            CHECK (communication_rating BETWEEN 1 AND 5),
  market_knowledge_rating      integer            CHECK (market_knowledge_rating BETWEEN 1 AND 5),
  overall_score                decimal,
  written_comment              text,
  candidate_satisfaction_score integer,
  flagged_by_recruiter         boolean            NOT NULL DEFAULT false,
  flag_reason                  text,
  admin_reviewed               boolean            NOT NULL DEFAULT false,
  visible                      boolean            NOT NULL DEFAULT true,
  created_at                   timestamptz        NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 20. recruiter_scores
-- ------------------------------------------------------------------
CREATE TABLE public.recruiter_scores (
  id                             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_profile_id           uuid        NOT NULL UNIQUE REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,
  average_speed_score            decimal,
  average_quality_score          decimal,
  average_communication_score    decimal,
  average_market_knowledge_score decimal,
  overall_average                decimal,
  total_hm_reviews               integer     NOT NULL DEFAULT 0,
  total_candidate_reviews        integer     NOT NULL DEFAULT 0,
  average_candidate_satisfaction decimal,
  last_calculated_at             timestamptz
);

-- ------------------------------------------------------------------
-- 21. notifications
-- ------------------------------------------------------------------
CREATE TABLE public.notifications (
  id                  uuid                     PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id   uuid                     NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type   text                     NOT NULL,
  related_entity_type text,
  related_entity_id   uuid,
  subject             text,
  body                text,
  sent_at             timestamptz,
  opened_at           timestamptz,
  clicked_at          timestamptz,
  status              notification_status_enum NOT NULL DEFAULT 'sent',
  reminder_sent       boolean                  NOT NULL DEFAULT false,
  reminder_sent_at    timestamptz,
  created_at          timestamptz              NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- 22. vetting_applications
-- ------------------------------------------------------------------
CREATE TABLE public.vetting_applications (
  id                          uuid                PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_profile_id        uuid                NOT NULL REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,
  linkedin_url                text,
  markets_claimed             text[],
  client_company_one          text,
  client_company_two          text,
  client_company_three        text,
  placements_last_two_years   integer,
  sectors_worked              text[],
  application_status          vetting_status_enum NOT NULL DEFAULT 'pending',
  rejection_category          text,
  rejection_message_sent      text,
  admin_notes                 text,
  reviewed_at                 timestamptz,
  submitted_at                timestamptz         NOT NULL DEFAULT now(),
  reapplication_allowed       boolean             NOT NULL DEFAULT true,
  reapplication_eligible_from timestamptz
);

-- ------------------------------------------------------------------
-- 23. admin_actions_log
-- ------------------------------------------------------------------
CREATE TABLE public.admin_actions_log (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id       uuid        NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  action_type         text        NOT NULL,
  related_entity_type text,
  related_entity_id   uuid,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- =================================================================
-- UPDATED_AT TRIGGER
-- Automatically maintains updated_at on tables that carry it.
-- =================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_recruiter_profiles_updated_at
  BEFORE UPDATE ON public.recruiter_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_hiring_company_profiles_updated_at
  BEFORE UPDATE ON public.hiring_company_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =================================================================
-- INDEXES
-- =================================================================

-- users
CREATE INDEX idx_users_email     ON public.users(email);
CREATE INDEX idx_users_user_type ON public.users(user_type);
CREATE INDEX idx_users_status    ON public.users(status);

-- recruiter_profiles
CREATE INDEX idx_rp_user_id      ON public.recruiter_profiles(user_id);
CREATE INDEX idx_rp_status       ON public.recruiter_profiles(status);
CREATE INDEX idx_rp_availability ON public.recruiter_profiles(availability_status);
CREATE INDEX idx_rp_relevance    ON public.recruiter_profiles(relevance_score_cache DESC);

-- recruiter_sectors
CREATE INDEX idx_rs_profile_id   ON public.recruiter_sectors(recruiter_profile_id);
CREATE INDEX idx_rs_sector_name  ON public.recruiter_sectors(sector_name);

-- recruiter_locations
CREATE INDEX idx_rl_profile_id   ON public.recruiter_locations(recruiter_profile_id);
CREATE INDEX idx_rl_country      ON public.recruiter_locations(country);

-- recruiter_tools
CREATE INDEX idx_rt_profile_id   ON public.recruiter_tools(recruiter_profile_id);

-- hiring_company_profiles
CREATE INDEX idx_hcp_user_id     ON public.hiring_company_profiles(user_id);
CREATE INDEX idx_hcp_domain      ON public.hiring_company_profiles(company_domain);

-- blocked_email_domains
CREATE INDEX idx_bed_domain      ON public.blocked_email_domains(domain);

-- jobs
CREATE INDEX idx_jobs_hc_id      ON public.jobs(hiring_company_id);
CREATE INDEX idx_jobs_status     ON public.jobs(status);
CREATE INDEX idx_jobs_sector     ON public.jobs(sector);
CREATE INDEX idx_jobs_country    ON public.jobs(location_country);
CREATE INDEX idx_jobs_seniority  ON public.jobs(seniority_level);
CREATE INDEX idx_jobs_role_type  ON public.jobs(role_type);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);

-- job_recruiter_assignments
CREATE INDEX idx_jra_job_id       ON public.job_recruiter_assignments(job_id);
CREATE INDEX idx_jra_recruiter_id ON public.job_recruiter_assignments(recruiter_id);
CREATE INDEX idx_jra_status       ON public.job_recruiter_assignments(status);

-- milestones
CREATE INDEX idx_ms_assignment_id ON public.milestones(job_recruiter_assignment_id);
CREATE INDEX idx_ms_status        ON public.milestones(status);

-- candidate_profiles
CREATE INDEX idx_cp_assignment_id ON public.candidate_profiles(job_recruiter_assignment_id);
CREATE INDEX idx_cp_email         ON public.candidate_profiles(candidate_email);

-- cv_submissions
CREATE INDEX idx_cvs_assignment_id ON public.cv_submissions(job_recruiter_assignment_id);
CREATE INDEX idx_cvs_milestone_id  ON public.cv_submissions(milestone_id);

-- interviews
CREATE INDEX idx_iv_assignment_id ON public.interviews(job_recruiter_assignment_id);
CREATE INDEX idx_iv_candidate_id  ON public.interviews(candidate_profile_id);

-- offers
CREATE INDEX idx_of_assignment_id ON public.offers(job_recruiter_assignment_id);
CREATE INDEX idx_of_candidate_id  ON public.offers(candidate_profile_id);
CREATE INDEX idx_of_token         ON public.offers(acceptance_token);

-- messages
CREATE INDEX idx_msg_job_id       ON public.messages(job_id);
CREATE INDEX idx_msg_sender_id    ON public.messages(sender_user_id);
CREATE INDEX idx_msg_recipient_id ON public.messages(recipient_user_id);
CREATE INDEX idx_msg_sent_at      ON public.messages(sent_at DESC);

-- payments
CREATE INDEX idx_pay_assignment_id ON public.payments(job_recruiter_assignment_id);
CREATE INDEX idx_pay_milestone_id  ON public.payments(milestone_id);
CREATE INDEX idx_pay_status        ON public.payments(status);
CREATE INDEX idx_pay_stripe_pi     ON public.payments(stripe_payment_intent_id);

-- disputes
CREATE INDEX idx_dis_milestone_id  ON public.disputes(milestone_id);
CREATE INDEX idx_dis_assignment_id ON public.disputes(job_recruiter_assignment_id);
CREATE INDEX idx_dis_status        ON public.disputes(status);

-- reviews
CREATE INDEX idx_rev_assignment_id ON public.reviews(job_recruiter_assignment_id);
CREATE INDEX idx_rev_reviewer_id   ON public.reviews(reviewer_user_id);
CREATE INDEX idx_rev_visible       ON public.reviews(visible);

-- recruiter_scores
CREATE INDEX idx_rsc_profile_id    ON public.recruiter_scores(recruiter_profile_id);

-- notifications
CREATE INDEX idx_notif_recipient  ON public.notifications(recipient_user_id);
CREATE INDEX idx_notif_status     ON public.notifications(status);
CREATE INDEX idx_notif_created_at ON public.notifications(created_at DESC);

-- vetting_applications
CREATE INDEX idx_va_profile_id ON public.vetting_applications(recruiter_profile_id);
CREATE INDEX idx_va_status     ON public.vetting_applications(application_status);

-- admin_actions_log
CREATE INDEX idx_aal_admin_id   ON public.admin_actions_log(admin_user_id);
CREATE INDEX idx_aal_entity     ON public.admin_actions_log(related_entity_type, related_entity_id);
CREATE INDEX idx_aal_created_at ON public.admin_actions_log(created_at DESC);

-- =================================================================
-- ROW LEVEL SECURITY
-- =================================================================

ALTER TABLE public.users                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_sectors         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_locations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_tools           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hiring_company_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_email_domains     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whitelisted_domains       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_recruiter_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_submissions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_scores          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vetting_applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions_log         ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- RLS POLICIES
-- =================================================================

-- ------------------------------------------------------------------
-- users — read/update own record only
-- ------------------------------------------------------------------
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid() OR is_admin());

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING     (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------------
-- recruiter_profiles
-- Approved profiles are readable by all authenticated users.
-- Own profile is always readable/writable.
-- ------------------------------------------------------------------
CREATE POLICY "rp_select" ON public.recruiter_profiles
  FOR SELECT USING (
    status = 'approved'
    OR user_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "rp_insert_own" ON public.recruiter_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "rp_update_own" ON public.recruiter_profiles
  FOR UPDATE USING (user_id = auth.uid() OR is_admin());

-- ------------------------------------------------------------------
-- recruiter_sectors — inherit recruiter_profiles visibility
-- ------------------------------------------------------------------
CREATE POLICY "rs_select" ON public.recruiter_sectors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_profile_id
        AND (rp.status = 'approved' OR rp.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "rs_insert_own" ON public.recruiter_sectors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_profile_id AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "rs_update_own" ON public.recruiter_sectors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_profile_id
        AND (rp.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "rs_delete_own" ON public.recruiter_sectors
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_profile_id
        AND (rp.user_id = auth.uid() OR is_admin())
    )
  );

-- ------------------------------------------------------------------
-- recruiter_locations — inherit recruiter_profiles visibility
-- ------------------------------------------------------------------
CREATE POLICY "rl_select" ON public.recruiter_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_profile_id
        AND (rp.status = 'approved' OR rp.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "rl_insert_own" ON public.recruiter_locations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_profile_id AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "rl_update_own" ON public.recruiter_locations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_profile_id
        AND (rp.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "rl_delete_own" ON public.recruiter_locations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_profile_id
        AND (rp.user_id = auth.uid() OR is_admin())
    )
  );

-- ------------------------------------------------------------------
-- recruiter_tools — inherit recruiter_profiles visibility
-- ------------------------------------------------------------------
CREATE POLICY "rto_select" ON public.recruiter_tools
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_profile_id
        AND (rp.status = 'approved' OR rp.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "rto_insert_own" ON public.recruiter_tools
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_profile_id AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "rto_update_own" ON public.recruiter_tools
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_profile_id
        AND (rp.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "rto_delete_own" ON public.recruiter_tools
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_profile_id
        AND (rp.user_id = auth.uid() OR is_admin())
    )
  );

-- ------------------------------------------------------------------
-- hiring_company_profiles — owner or admin only
-- ------------------------------------------------------------------
CREATE POLICY "hcp_select" ON public.hiring_company_profiles
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "hcp_insert_own" ON public.hiring_company_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "hcp_update_own" ON public.hiring_company_profiles
  FOR UPDATE USING (user_id = auth.uid() OR is_admin());

-- ------------------------------------------------------------------
-- blocked_email_domains — any authenticated user can read; admin writes
-- ------------------------------------------------------------------
CREATE POLICY "bed_select" ON public.blocked_email_domains
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "bed_insert_admin" ON public.blocked_email_domains
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "bed_delete_admin" ON public.blocked_email_domains
  FOR DELETE USING (is_admin());

-- ------------------------------------------------------------------
-- whitelisted_domains — admin only
-- ------------------------------------------------------------------
CREATE POLICY "wd_select_admin" ON public.whitelisted_domains
  FOR SELECT USING (is_admin());

CREATE POLICY "wd_insert_admin" ON public.whitelisted_domains
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "wd_update_admin" ON public.whitelisted_domains
  FOR UPDATE USING (is_admin());

CREATE POLICY "wd_delete_admin" ON public.whitelisted_domains
  FOR DELETE USING (is_admin());

-- ------------------------------------------------------------------
-- jobs — readable by all authenticated users
-- ------------------------------------------------------------------
CREATE POLICY "jobs_select" ON public.jobs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "jobs_insert_hm" ON public.jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.hiring_company_profiles hcp
      WHERE hcp.id = hiring_company_id AND hcp.user_id = auth.uid()
    )
  );

CREATE POLICY "jobs_update_hm" ON public.jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.hiring_company_profiles hcp
      WHERE hcp.id = hiring_company_id AND hcp.user_id = auth.uid()
    )
    OR is_admin()
  );

-- ------------------------------------------------------------------
-- job_recruiter_assignments — recruiter, HM on that job, or admin
-- ------------------------------------------------------------------
CREATE POLICY "jra_select" ON public.job_recruiter_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_id AND rp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE j.id = job_id AND hcp.user_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "jra_insert_admin" ON public.job_recruiter_assignments
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "jra_update_admin" ON public.job_recruiter_assignments
  FOR UPDATE USING (is_admin());

-- ------------------------------------------------------------------
-- milestones — recruiter or HM on the assignment, or admin
-- ------------------------------------------------------------------
CREATE POLICY "ms_select" ON public.milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.jobs j ON j.id = jra.job_id
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE jra.id = job_recruiter_assignment_id AND hcp.user_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "ms_insert_admin" ON public.milestones
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "ms_update_admin" ON public.milestones
  FOR UPDATE USING (is_admin());

-- ------------------------------------------------------------------
-- candidate_profiles — recruiter (rw), HM (r), admin (rw)
-- ------------------------------------------------------------------
CREATE POLICY "candp_select" ON public.candidate_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.jobs j ON j.id = jra.job_id
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE jra.id = job_recruiter_assignment_id AND hcp.user_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "candp_insert_recruiter" ON public.candidate_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "candp_update_recruiter" ON public.candidate_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
    OR is_admin()
  );

-- ------------------------------------------------------------------
-- cv_submissions — recruiter (rw), HM (r + confirm), admin (rw)
-- ------------------------------------------------------------------
CREATE POLICY "cvs_select" ON public.cv_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.jobs j ON j.id = jra.job_id
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE jra.id = job_recruiter_assignment_id AND hcp.user_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "cvs_insert_recruiter" ON public.cv_submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "cvs_update" ON public.cv_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.jobs j ON j.id = jra.job_id
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE jra.id = job_recruiter_assignment_id AND hcp.user_id = auth.uid()
    )
    OR is_admin()
  );

-- ------------------------------------------------------------------
-- interviews — recruiter (rw), HM (rw), admin (rw)
-- ------------------------------------------------------------------
CREATE POLICY "iv_select" ON public.interviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.jobs j ON j.id = jra.job_id
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE jra.id = job_recruiter_assignment_id AND hcp.user_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "iv_insert_recruiter" ON public.interviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "iv_update" ON public.interviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.jobs j ON j.id = jra.job_id
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE jra.id = job_recruiter_assignment_id AND hcp.user_id = auth.uid()
    )
    OR is_admin()
  );

-- ------------------------------------------------------------------
-- offers — recruiter (rw), HM (rw), admin (rw)
-- ------------------------------------------------------------------
CREATE POLICY "of_select" ON public.offers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.jobs j ON j.id = jra.job_id
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE jra.id = job_recruiter_assignment_id AND hcp.user_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "of_insert_recruiter" ON public.offers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "of_update" ON public.offers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.jobs j ON j.id = jra.job_id
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE jra.id = job_recruiter_assignment_id AND hcp.user_id = auth.uid()
    )
    OR is_admin()
  );

-- ------------------------------------------------------------------
-- messages — sender or recipient only
-- ------------------------------------------------------------------
CREATE POLICY "msg_select" ON public.messages
  FOR SELECT USING (
    sender_user_id = auth.uid()
    OR recipient_user_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "msg_insert_sender" ON public.messages
  FOR INSERT WITH CHECK (sender_user_id = auth.uid());

-- ------------------------------------------------------------------
-- payments — recruiter, HM on that assignment, or admin
-- ------------------------------------------------------------------
CREATE POLICY "pay_select" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.jobs j ON j.id = jra.job_id
      JOIN public.hiring_company_profiles hcp ON hcp.id = j.hiring_company_id
      WHERE jra.id = job_recruiter_assignment_id AND hcp.user_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "pay_insert_admin" ON public.payments
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "pay_update_admin" ON public.payments
  FOR UPDATE USING (is_admin());

-- ------------------------------------------------------------------
-- disputes — raised_by, raised_against, or admin
-- ------------------------------------------------------------------
CREATE POLICY "dis_select" ON public.disputes
  FOR SELECT USING (
    raised_by_user_id = auth.uid()
    OR raised_against_user_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "dis_insert" ON public.disputes
  FOR INSERT WITH CHECK (raised_by_user_id = auth.uid() OR is_admin());

CREATE POLICY "dis_update_admin" ON public.disputes
  FOR UPDATE USING (is_admin());

-- ------------------------------------------------------------------
-- reviews — reviewer (rw), reviewed recruiter (r), admin (rw)
-- ------------------------------------------------------------------
CREATE POLICY "rev_select" ON public.reviews
  FOR SELECT USING (
    reviewer_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.job_recruiter_assignments jra
      JOIN public.recruiter_profiles rp ON rp.id = jra.recruiter_id
      WHERE jra.id = job_recruiter_assignment_id AND rp.user_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "rev_insert" ON public.reviews
  FOR INSERT WITH CHECK (reviewer_user_id = auth.uid());

CREATE POLICY "rev_update_admin" ON public.reviews
  FOR UPDATE USING (is_admin());

-- ------------------------------------------------------------------
-- recruiter_scores — readable by all authenticated users; admin writes
-- (scores are used for public ranking/display of recruiters)
-- ------------------------------------------------------------------
CREATE POLICY "rsc_select" ON public.recruiter_scores
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "rsc_insert_admin" ON public.recruiter_scores
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "rsc_update_admin" ON public.recruiter_scores
  FOR UPDATE USING (is_admin());

-- ------------------------------------------------------------------
-- notifications — own user or admin
-- ------------------------------------------------------------------
CREATE POLICY "notif_select" ON public.notifications
  FOR SELECT USING (recipient_user_id = auth.uid() OR is_admin());

CREATE POLICY "notif_update_own" ON public.notifications
  FOR UPDATE USING (recipient_user_id = auth.uid());

-- ------------------------------------------------------------------
-- vetting_applications — own recruiter or admin
-- ------------------------------------------------------------------
CREATE POLICY "va_select" ON public.vetting_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_profile_id AND rp.user_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "va_insert" ON public.vetting_applications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.id = recruiter_profile_id AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "va_update_admin" ON public.vetting_applications
  FOR UPDATE USING (is_admin());

-- ------------------------------------------------------------------
-- admin_actions_log — admin only
-- ------------------------------------------------------------------
CREATE POLICY "aal_select_admin" ON public.admin_actions_log
  FOR SELECT USING (is_admin());

CREATE POLICY "aal_insert_admin" ON public.admin_actions_log
  FOR INSERT WITH CHECK (is_admin());

-- =================================================================
-- SEED DATA — blocked consumer email domains
-- =================================================================

INSERT INTO public.blocked_email_domains (domain) VALUES
  ('gmail.com'),
  ('googlemail.com'),
  ('hotmail.com'),
  ('hotmail.co.uk'),
  ('outlook.com'),
  ('live.com'),
  ('msn.com'),
  ('yahoo.com'),
  ('yahoo.co.uk'),
  ('yahoo.ie'),
  ('icloud.com'),
  ('me.com'),
  ('mac.com'),
  ('aol.com'),
  ('protonmail.com'),
  ('zoho.com'),
  ('ymail.com'),
  ('rocketmail.com');
