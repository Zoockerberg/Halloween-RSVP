# Halloween Party RSVP

Haunted-house RSVP page for the Halloween party on Saturday, October 31, from 5:30 pm.
Live at https://halloween-rsvp-gamma.vercel.app. Pushing to `main` redeploys it.

- `index.html` is the whole page: the 3D walk-in and the RSVP card.
- `guests/index.html` is the guest list page for the organiser (`/guests`), with a Copy list button.
- `api/rsvp.js` stores the guest list in the Upstash Redis database connected
  to the Vercel project (GET lists names, POST `{"name": ...}` adds one).
- `Code.gs` is the older Google Apps Script backend. The page links to it as a
  backup while the database isn't connected.

## Connecting the database (once, in the Vercel dashboard)

1. Open the **halloween-rsvp** project → **Storage** → **Create Database**.
2. Pick **Upstash for Redis** (free plan), create it, and connect it to the
   project for all environments.
3. Redeploy (Deployments → ⋯ → Redeploy), or push any commit.
