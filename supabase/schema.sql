-- North Hodge Assembly of God -- Choir Hub
-- Run this whole file once in the Supabase SQL Editor (Project > SQL Editor > New query).

-- People: one row per device/browser that has set a name.
create table if not exists people (
  device_id text primary key,
  name text not null,
  personal_pin text,
  notifications_last_seen timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists people_name_pin_unique
  on people (lower(name), personal_pin)
  where personal_pin is not null;

create table if not exists app_config (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

-- Songs: the core library. Every link field is optional on purpose --
-- songs are added over time and rarely have everything filled in at once.
create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  composer text,
  times_sung int,
  first_date date,
  most_recent_date date,
  lyrics_url text,
  chords_url text,
  sheet_music_url text,
  soprano_url text,
  alto_url text,
  tenor_url text,
  bass_url text,
  full_mix_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Setlists: one row per service (a given date + AM or PM).
create table if not exists setlists (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  service text not null check (service in ('AM', 'PM', 'CP')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Setlist songs: an ordered list of songs within a setlist, each with an
-- optional free-text note (a key, a person's name, "Choir", anything).
create table if not exists setlist_songs (
  id uuid primary key default gen_random_uuid(),
  setlist_id uuid not null references setlists(id) on delete cascade,
  song_id uuid not null references songs(id) on delete cascade,
  note text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Events (rehearsals, performances, etc.) -- separate from setlists.
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  event_time text,
  location text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists event_rsvps (
  event_id uuid not null references events(id) on delete cascade,
  device_id text not null references people(device_id) on delete cascade,
  name text not null,
  status text not null check (status in ('yes','no','maybe')),
  updated_at timestamptz not null default now(),
  primary key (event_id, device_id)
);

-- Prayer requests
create table if not exists prayer_requests (
  id uuid primary key default gen_random_uuid(),
  device_id text references people(device_id) on delete set null,
  name text not null default 'Anonymous',
  text text not null,
  pray_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists prayer_prayed (
  request_id uuid not null references prayer_requests(id) on delete cascade,
  device_id text not null references people(device_id) on delete cascade,
  primary key (request_id, device_id)
);

-- Announcements (leader-posted)
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- Push notification subscriptions
create table if not exists push_subscriptions (
  device_id text primary key references people(device_id) on delete cascade,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

-- Row Level Security: enabled on every table. The browser never talks to
-- Supabase directly -- it only calls this app's own /app/api routes, which
-- use the Supabase *service role* key server-side (service role bypasses
-- RLS). No public policies are needed; all access goes through the API.

alter table people enable row level security;
alter table songs enable row level security;
alter table setlists enable row level security;
alter table setlist_songs enable row level security;
alter table events enable row level security;
alter table event_rsvps enable row level security;
alter table prayer_requests enable row level security;
alter table prayer_prayed enable row level security;
alter table announcements enable row level security;
alter table push_subscriptions enable row level security;
alter table app_config enable row level security;
