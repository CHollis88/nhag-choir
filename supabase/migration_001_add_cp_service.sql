-- Migration: adds "CP" (Choir Practice) as a valid option alongside AM/PM
-- for setlists. Safe to run on your existing live database.
--
-- Run this once in Supabase: Project > SQL Editor > New query > paste this
-- whole file > Run.

alter table setlists drop constraint if exists setlists_service_check;
alter table setlists add constraint setlists_service_check
  check (service in ('AM', 'PM', 'CP'));
