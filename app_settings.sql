-- Swapnoneer Ulama Sangha
-- Additive-only setting for the software launch/background color.
-- This does not modify or delete any existing table or data.

create table if not exists public.app_settings (
  id integer primary key check (id = 1),
  launch_background_color text not null default '#ffffff',
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, launch_background_color)
values (1, '#ffffff')
on conflict (id) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists "public can read app settings" on public.app_settings;
create policy "public can read app settings"
on public.app_settings
for select
to anon, authenticated
using (true);

drop policy if exists "admins can insert app settings" on public.app_settings;
create policy "admins can insert app settings"
on public.app_settings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "admins can update app settings" on public.app_settings;
create policy "admins can update app settings"
on public.app_settings
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);
