-- Add 'open_for_proposals' to job_status_enum, positioned after 'draft'
-- in the lifecycle (draft → open_for_proposals → active → …).
-- PostgreSQL ALTER TYPE ADD VALUE cannot be run inside a transaction,
-- so this migration must be executed outside a transaction block.
ALTER TYPE job_status_enum ADD VALUE IF NOT EXISTS 'open_for_proposals' AFTER 'draft';
