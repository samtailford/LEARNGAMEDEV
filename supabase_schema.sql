-- LearnGameDev account system — Phase 1: auth, saved tutorials, completed tutorials
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste this whole file -> Run

-- Public profile info, one row per signed-up user (auth.users itself is private/managed by Supabase)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz not null default now()
);

-- Which tutorials a user has bookmarked/saved
create table public.saved_tutorials (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tutorial_id text not null,
  saved_at timestamptz not null default now(),
  unique (user_id, tutorial_id)
);

-- Which tutorials a user has marked as completed
create table public.completed_tutorials (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tutorial_id text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, tutorial_id)
);

-- Row Level Security: every table below is only readable/writable by its own owner
-- (profiles are readable by everyone since usernames are meant to be public later for the social layer)

alter table public.profiles enable row level security;
alter table public.saved_tutorials enable row level security;
alter table public.completed_tutorials enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view their own saved tutorials"
  on public.saved_tutorials for select
  using (auth.uid() = user_id);

create policy "Users can save tutorials for themselves"
  on public.saved_tutorials for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave their own saved tutorials"
  on public.saved_tutorials for delete
  using (auth.uid() = user_id);

create policy "Users can view their own completed tutorials"
  on public.completed_tutorials for select
  using (auth.uid() = user_id);

create policy "Users can mark tutorials complete for themselves"
  on public.completed_tutorials for insert
  with check (auth.uid() = user_id);

create policy "Users can un-complete their own completed tutorials"
  on public.completed_tutorials for delete
  using (auth.uid() = user_id);

-- Profiles are created automatically via this trigger, not by the client,
-- so it works regardless of email-confirmation timing/session state.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Votes: one row per (account, tutorial), account-backed so it's a real
-- account-wide vote rather than a per-browser guess. Raw rows stay private
-- to their owner; a public view exposes only the aggregate counts.
create table public.votes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tutorial_id text not null,
  direction text not null check (direction in ('up', 'down')),
  created_at timestamptz not null default now(),
  unique (user_id, tutorial_id)
);

alter table public.votes enable row level security;

create policy "Users can view their own votes"
  on public.votes for select
  using (auth.uid() = user_id);

create policy "Users can cast votes for themselves"
  on public.votes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own votes"
  on public.votes for delete
  using (auth.uid() = user_id);

-- Public aggregate: total up/down per tutorial, visible to every visitor
-- (including signed-out ones), without exposing who voted which way.
create view public.vote_counts as
  select tutorial_id,
         count(*) filter (where direction = 'up') as up,
         count(*) filter (where direction = 'down') as down
  from public.votes
  group by tutorial_id;

grant select on public.vote_counts to anon, authenticated;
