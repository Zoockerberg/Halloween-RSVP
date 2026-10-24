# Halloween Party RSVP

Haunted-house RSVP page for the Halloween party on Saturday, October 31, from 5:30 pm.
Guests walk up a graveyard path into a haunted house and add their name.
Names go to a Google Doc.

- `index.html` is the whole site. Vercel serves it as a static page and it
  calls the Apps Script as a JSON API. Pushing to `main` redeploys it.
- `Code.gs` is the Google Apps Script backend. It reads the guest list from
  the doc, adds names to it, and still serves the page on the script's own
  link (loaded from this repo), so the old QR code keeps working.

## Setup (once)

1. **Vercel:** at [vercel.com/new](https://vercel.com/new), import this repo.
   Framework preset: **Other**, no build command. Set the project name to the
   address you want (`<name>.vercel.app`).
2. **Apps Script:** replace everything in `Code.gs` with [`Code.gs`](./Code.gs),
   then go to **Deploy → Manage deployments**, edit the **Web app** deployment,
   set **Version** to **New version** and tap **Deploy**. The script URL stays
   the same.
