-- Ensure role-checking RLS policies only execute for authenticated JWT roles.
-- The helper function itself is granted only to authenticated, so these policies must not target PUBLIC/anon.
drop policy if exists "series editor select" on public.series;
create policy "series editor select" on public.series
for select to authenticated
using (public.current_flixo_role() in ('editor','admin'));

drop policy if exists "submissions creator or editor select" on public.content_submissions;
create policy "submissions creator or editor select" on public.content_submissions
for select to authenticated
using (
  submitted_by = auth.uid()
  or public.current_flixo_role() in ('editor','admin')
);

drop policy if exists "reviews editor select" on public.content_reviews;
create policy "reviews editor select" on public.content_reviews
for select to authenticated
using (public.current_flixo_role() in ('editor','admin'));
