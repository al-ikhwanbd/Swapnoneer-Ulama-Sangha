-- সদস্যভিত্তিক লভ্যাংশ Public/Hidden ব্যবস্থার জন্য প্রয়োজনীয় ন্যূনতম টেবিল
create table if not exists public.member_dividend_visibility (
  member_id bigint primary key references public.members(id) on delete cascade,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.member_dividend_visibility enable row level security;

-- Public visitor শুধু যেসব সদস্যের লভ্যাংশ Public করা হয়েছে সেগুলো পড়তে পারবে।
drop policy if exists "public can read public dividend visibility" on public.member_dividend_visibility;
create policy "public can read public dividend visibility"
on public.member_dividend_visibility
for select
using (is_public = true or exists (
  select 1 from public.admin_users au where au.user_id = auth.uid()
));

-- শুধু অনুমোদিত Admin visibility পরিবর্তন করতে পারবে।
drop policy if exists "admin can manage dividend visibility" on public.member_dividend_visibility;
create policy "admin can manage dividend visibility"
on public.member_dividend_visibility
for all
to authenticated
using (exists (
  select 1 from public.admin_users au where au.user_id = auth.uid()
))
with check (exists (
  select 1 from public.admin_users au where au.user_id = auth.uid()
));

-- Data API-তে টেবিলটি expose করার পর ওয়েবসাইট থেকে ব্যবহার করা যাবে।
