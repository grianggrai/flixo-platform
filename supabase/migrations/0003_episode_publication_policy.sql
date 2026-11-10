-- Only expose published episodes for a published, rights-cleared series.
drop policy if exists "published episodes public read" on public.episodes;
create policy "published episodes public read" on public.episodes
for select using (
  status = 'published'
  and exists (
    select 1 from public.series s
    where s.id = series_id
      and s.status = 'published'
      and s.rights_verified = true
  )
);
