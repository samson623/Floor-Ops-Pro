-- Floor Ops Pro is currently a browser-local demonstration. Keep the future
-- production schema inaccessible through public client keys until real
-- Supabase Auth onboarding and role-aware RLS policies are implemented.

begin;

revoke all privileges on all tables in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all privileges on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all privileges on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

-- Never fall back to the sample tenant. A caller without an authenticated
-- profile must resolve to NULL so tenant policies fail closed.
create or replace function public.get_user_company_id()
returns uuid
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select company_id
  from public.profiles
  where id = (select auth.uid())
  limit 1;
$$;

create or replace function public.get_user_role()
returns text
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select role
  from public.profiles
  where id = (select auth.uid())
  limit 1;
$$;

-- User-supplied metadata may provide a display name, but never an
-- authorization role. Privileged roles are assigned during onboarding.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'New User'),
    new.email,
    'installer'
  );
  return new;
end;
$$;

-- Trigger helpers and tenant lookups are internal implementation details,
-- not public RPC endpoints.
revoke execute on function public.audit_trigger_function() from public, anon, authenticated;
revoke execute on function public.get_user_company_id() from public, anon, authenticated;
revoke execute on function public.get_user_role() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

commit;
