-- Swapnoneer Ulama Sangha - Web Settings
-- Additive migration: does not delete or alter existing business data.
create table if not exists public.app_settings (
  id integer primary key check (id = 1),
  launch_background_color text not null default '#ffffff',
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_settings add column if not exists settings jsonb not null default '{}'::jsonb;
alter table public.app_settings add column if not exists launch_background_color text not null default '#ffffff';
alter table public.app_settings add column if not exists updated_at timestamptz not null default now();

insert into public.app_settings (id, launch_background_color, settings)
values (1, '#ffffff', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.app_settings enable row level security;
drop policy if exists "public can read app settings" on public.app_settings;
create policy "public can read app settings" on public.app_settings for select to anon, authenticated using (true);
drop policy if exists "admins can insert app settings" on public.app_settings;
create policy "admins can insert app settings" on public.app_settings for insert to authenticated with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));
drop policy if exists "admins can update app settings" on public.app_settings;
create policy "admins can update app settings" on public.app_settings for update to authenticated using (exists (select 1 from public.admin_users au where au.user_id = auth.uid())) with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

-- Ensure PostgREST API roles can reach the table; RLS still controls which rows
-- authenticated admins may write.
grant select on table public.app_settings to anon, authenticated;
grant insert, update on table public.app_settings to authenticated;


-- Shared website logo storage (public read, Admin-only write).
-- Safe to run after the original migration; does not delete existing data.
insert into storage.buckets (id, name, public)
values ('website-assets', 'website-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "public can read website assets" on storage.objects;
create policy "public can read website assets"
on storage.objects for select
to public
using (bucket_id = 'website-assets');

drop policy if exists "admins can upload website assets" on storage.objects;
create policy "admins can upload website assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'website-assets'
  and exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "admins can update website assets" on storage.objects;
create policy "admins can update website assets"
on storage.objects for update
to authenticated
using (
  bucket_id = 'website-assets'
  and exists (select 1 from public.admin_users au where au.user_id = auth.uid())
)
with check (
  bucket_id = 'website-assets'
  and exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "admins can delete website assets" on storage.objects;
create policy "admins can delete website assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'website-assets'
  and exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);
