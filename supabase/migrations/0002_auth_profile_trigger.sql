-- Create a profile row automatically when Supabase Auth creates a user.
-- The user role is not copied from user-editable metadata; it always defaults to viewer.
create or replace function public.handle_new_flixo_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    'viewer',
    'active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_flixo on auth.users;
create trigger on_auth_user_created_flixo
  after insert on auth.users
  for each row execute procedure public.handle_new_flixo_user();
