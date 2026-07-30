-- Add more Ireland-focused RSS sources, and make future re-runs of this
-- kind of seed insert idempotent (the original 0001 seed had no unique
-- constraint on rss_sources, so a bare "on conflict do nothing" would
-- silently do nothing *useful* — there was nothing for it to conflict on).
alter table rss_sources
  add constraint rss_sources_url_unique unique (url);

insert into rss_sources (name, url, country) values
  ('Silicon Republic Startups', 'https://www.siliconrepublic.com/start-ups/feed', 'Ireland'),
  ('IrishTech News', 'https://irishtechnews.ie/feed/', 'Ireland'),
  ('Fora.ie', 'https://www.fora.ie/feed/', 'Ireland'),
  ('Business Post Tech', 'https://www.businesspost.ie/feed/', 'Ireland')
on conflict (url) do nothing;
