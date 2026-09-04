-- Migration: adds Personal PIN (multi-device reconnect), notification
-- read-tracking, and a small app_config table (used to store the
-- spreadsheet sync link). Safe to run on your existing live database.
--
-- Run this once in Supabase: Project > SQL Editor > New query > paste this
-- whole file > Run.

alter table people add column if not exists personal_pin text;
alter table people add column if not exists notifications_last_seen timestamptz;

create unique index if not exists people_name_pin_unique
  on people (lower(name), personal_pin)
  where personal_pin is not null;

-- Small key/value settings table, used for things like the spreadsheet
-- sync link. Only ever read/written by leader-gated API routes.
create table if not exists app_config (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);
alter table app_config enable row level security;
