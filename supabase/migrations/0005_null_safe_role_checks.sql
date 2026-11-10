-- Harden role checks against NULL profile roles in SECURITY DEFINER RPCs.
-- PL/pgSQL IF treats NULL as false, so IS DISTINCT FROM / COALESCE are required here.

create or replace function public.submit_flixo_series(
  p_title text,
  p_slug text,
  p_synopsis text,
  p_genre text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_series_id uuid;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null or public.current_flixo_role() is distinct from 'creator' then
    raise exception 'creator role required' using errcode = '42501';
  end if;

  if length(trim(coalesce(p_title, ''))) < 2 or length(p_title) > 160 then
    raise exception 'invalid title' using errcode = '22023';
  end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'invalid slug' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_synopsis, ''))) < 20 or length(p_synopsis) > 5000 then
    raise exception 'invalid synopsis' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_genre, ''))) < 2 or length(p_genre) > 80 then
    raise exception 'invalid genre' using errcode = '22023';
  end if;

  insert into public.series (creator_id, title, slug, synopsis, genre, status, rights_verified)
  values (v_user_id, trim(p_title), p_slug, trim(p_synopsis), trim(p_genre), 'pending', false)
  returning id into v_series_id;

  insert into public.content_submissions (series_id, submitted_by, status)
  values (v_series_id, v_user_id, 'pending');

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (v_user_id, 'creator.series.submit', 'series', v_series_id::text, jsonb_build_object('status','pending'));

  return v_series_id;
end;
$$;

create or replace function public.review_flixo_series(
  p_series_id uuid,
  p_decision text,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_old_status text;
  v_new_status text;
begin
  if v_user_id is null or coalesce(public.current_flixo_role(), '') not in ('editor','admin') then
    raise exception 'editor or admin role required' using errcode = '42501';
  end if;
  if p_decision is null or p_decision not in ('approved','rejected','revision') then
    raise exception 'invalid review decision' using errcode = '22023';
  end if;
  if p_reason is not null and length(p_reason) > 3000 then
    raise exception 'review reason too long' using errcode = '22023';
  end if;

  select status into v_old_status
  from public.series
  where id = p_series_id
  for update;

  if not found then
    raise exception 'series not found' using errcode = 'P0002';
  end if;
  if v_old_status not in ('pending','revision') then
    raise exception 'series is not awaiting review' using errcode = '55000';
  end if;

  v_new_status := case p_decision
    when 'approved' then 'approved'
    when 'rejected' then 'rejected'
    else 'revision'
  end;

  insert into public.content_reviews (series_id, reviewer_id, decision, reason)
  values (p_series_id, v_user_id, p_decision, nullif(trim(p_reason), ''));

  update public.series set status = v_new_status where id = p_series_id;
  update public.content_submissions
  set status = p_decision
  where series_id = p_series_id and status in ('pending','revision');

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    v_user_id, 'admin.series.review', 'series', p_series_id::text,
    jsonb_build_object('decision',p_decision,'old_status',v_old_status,'new_status',v_new_status)
  );

  return jsonb_build_object('id', p_series_id, 'status', v_new_status, 'decision', p_decision);
end;
$$;

revoke all on function public.submit_flixo_series(text,text,text,text) from public;
grant execute on function public.submit_flixo_series(text,text,text,text) to authenticated;
revoke all on function public.review_flixo_series(uuid,text,text) from public;
grant execute on function public.review_flixo_series(uuid,text,text) to authenticated;
