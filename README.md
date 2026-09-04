# NHAG Choir

A real, installable app for the choir: a searchable song library (lyrics,
chords, sheet music, and per-voice-part practice track links), weekly AM/PM
setlists, a rehearsal/event calendar with RSVPs, a prayer wall, and
announcements. No Claude account needed for anyone -- this runs on its own,
for free, same setup pattern as the Young Adults app.

This is a genuinely **separate app** from the Young Adults hub -- its own
GitHub repo, its own Vercel project, and its own Supabase database. Same
free accounts you already have, just new projects within them.

---

## Step 1 -- Create a new Supabase project

1. In Supabase, click **New Project** (do not reuse the Young Adults
   project -- this needs its own separate database).
2. Once it's ready, go to **SQL Editor > New query**, paste in the entire
   contents of `supabase/schema.sql`, and click **Run**. This creates every
   table the app needs.
3. Open a second **New query**, paste in the entire contents of
   `supabase/seed_songs.sql`, and click **Run**. This imports your 298
   existing songs from the church's Song Log spreadsheet (titles, times
   sung, first/last sung date). Only run this once -- running it twice
   would create duplicate rows.
4. Go to **Project Settings > API** and copy the **Project URL**
   (`SUPABASE_URL`) and the **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`,
   click "Reveal" to see it).

## Step 2 -- Put the code on GitHub

Same process as before: create a new, empty, private repository (name it
something like `nhag-choir`), then from a terminal inside this unzipped
folder:
```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/nhag-choir.git
git push -u origin main
```

## Step 3 -- Generate your security keys

**AUTH_SECRET** -- run in any terminal: `openssl rand -hex 32`

**VAPID keys** (for push notifications) -- in the project folder:
```
npm install
npm run generate-vapid
```
This prints `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and
`NEXT_PUBLIC_VAPID_PUBLIC_KEY`.

**LEADER_PIN** -- pick whatever PIN you want choir leaders to use. This can
be different from the Young Adults app's PIN.

## Step 4 -- Deploy to Vercel

1. **Add New > Project**, import the `nhag-choir` repository.
2. **Before deploying**, expand Environment Variables and enter:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | from Step 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Step 1 |
   | `LEADER_PIN` | your chosen PIN |
   | `AUTH_SECRET` | from Step 3 |
   | `VAPID_PUBLIC_KEY` | from Step 3 |
   | `VAPID_PRIVATE_KEY` | from Step 3 |
   | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | from Step 3 |
   | `VAPID_SUBJECT` | `mailto:` + your email |
   | `CRON_SECRET` | a random string (generate with `openssl rand -hex 32`) |

3. **Important:** In the same setup screen, check that **Framework Preset**
   shows "Next.js" (not "Other") before deploying -- this tripped up the
   first app's initial deploy, so worth double-checking here from the
   start.
4. Click **Deploy**.

## Step 5 -- Test it

- Open the link, set your name, confirm all 5 tabs load (Songs, Setlists,
  Events, Prayer, News) and that all 298 songs show up under Songs.
- Tap the lock icon, enter your `LEADER_PIN`, and confirm you can add/edit
  a song, post a setlist, an event, and an announcement.
- Add to your home screen (Share > Add to Home Screen on iPhone, or the
  install prompt on Android) and accept the notification permission
  prompt to confirm push notifications work.

## Updating the app later

Same as before: edit the code, then
```
git add .
git commit -m "describe what changed"
git push
```
Vercel redeploys automatically at the same URL.
