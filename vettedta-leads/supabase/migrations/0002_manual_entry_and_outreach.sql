-- Session 2: manual company entry + reliable outreach status upserts.

-- The dashboard's "Add Company" form lets Keith create leads the RSS
-- ingestion misses (e.g. sourced from a VC portfolio page). Companies and
-- signals were previously writable only by Edge Functions (service role);
-- this opens inserts up to any signed-in user, same trust level as the
-- existing "authenticated users can view" policies.
create policy "Authenticated users can insert companies"
  on companies for insert
  to authenticated
  with check (true);

create policy "Authenticated users can insert signals"
  on signals for insert
  to authenticated
  with check (true);

-- The dashboard tracks one outreach status per (user, company). A unique
-- constraint lets the client upsert on that pair instead of juggling
-- select-then-insert-or-update races.
alter table outreach
  add constraint outreach_user_company_unique unique (user_id, company_id);
