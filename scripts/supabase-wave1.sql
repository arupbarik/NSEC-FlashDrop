-- FlashDrop Wave 1 Supabase schema setup
-- Run in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.items (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references auth.users(id) on delete cascade,
  seller_name text not null,
  seller_whatsapp text not null,
  title text not null,
  description text,
  price integer not null check (price > 0),
  category text not null check (category in ('Books', 'Electronics', 'Clothing', 'Furniture', 'Other')),
  condition text not null check (condition in ('Like New', 'Good', 'Fair')),
  image_url text,
  expires_at timestamptz not null,
  interested_count integer default 0 check (interested_count >= 0),
  is_sold boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_items_active on public.items (is_sold, expires_at);
create index if not exists idx_items_category on public.items (category);
create index if not exists idx_items_seller_id on public.items (seller_id);

alter table public.items enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'items' and policyname = 'Public can view active items'
  ) then
    create policy "Public can view active items"
    on public.items
    for select
    using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'items' and policyname = 'Auth users can insert own items'
  ) then
    create policy "Auth users can insert own items"
    on public.items
    for insert
    to authenticated
    with check (auth.uid() = seller_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'items' and policyname = 'Sellers can update own items'
  ) then
    create policy "Sellers can update own items"
    on public.items
    for update
    to authenticated
    using (auth.uid() = seller_id)
    with check (auth.uid() = seller_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'items' and policyname = 'Sellers can delete own items'
  ) then
    create policy "Sellers can delete own items"
    on public.items
    for delete
    to authenticated
    using (auth.uid() = seller_id);
  end if;
end $$;

create table if not exists public.interest_clicks (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.items(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  clicked_at timestamptz default now(),
  unique (item_id, user_id)
);

create index if not exists idx_interest_clicks_item_id on public.interest_clicks (item_id);
create index if not exists idx_interest_clicks_user_id on public.interest_clicks (user_id);

alter table public.interest_clicks enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'interest_clicks' and policyname = 'Public can view interest clicks'
  ) then
    create policy "Public can view interest clicks"
    on public.interest_clicks
    for select
    using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'interest_clicks' and policyname = 'Auth users can insert own interest click'
  ) then
    create policy "Auth users can insert own interest click"
    on public.interest_clicks
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;
end $$;

create or replace function public.increment_interest(item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.items
  set interested_count = interested_count + 1
  where id = item_id and is_sold = false and expires_at > now();
end;
$$;

revoke all on function public.increment_interest(uuid) from public;
grant execute on function public.increment_interest(uuid) to authenticated;

insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public can view item images'
  ) then
    create policy "Public can view item images"
    on storage.objects
    for select
    using (bucket_id = 'item-images');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated users can upload item images'
  ) then
    create policy "Authenticated users can upload item images"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'item-images' and auth.uid()::text = owner::text);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can update own item images'
  ) then
    create policy "Users can update own item images"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'item-images' and auth.uid()::text = owner::text)
    with check (bucket_id = 'item-images' and auth.uid()::text = owner::text);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can delete own item images'
  ) then
    create policy "Users can delete own item images"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'item-images' and auth.uid()::text = owner::text);
  end if;
end $$;
