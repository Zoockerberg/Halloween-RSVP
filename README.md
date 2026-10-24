# Halloween Party RSVP

Haunted-house RSVP page for the Halloween party on Saturday, October 31.
Guests walk up a graveyard path into a haunted house and add their name.
Names go to a Google Doc.

- `index.html` is the page. The Apps Script loads it from this repo, so
  changes pushed here go live within a few minutes with no redeploy.
- `Code.gs` is the Google Apps Script backend. It serves the page, reads the
  guest list from the doc and adds names to it.

## Setup (once)

1. In the Apps Script project, replace everything in `Code.gs` with
   [`Code.gs`](./Code.gs) and delete the `Index` file.
2. Go to **Deploy → Manage deployments**, tap the pencil, set **Version** to
   **New version** and tap **Deploy**. Allow the new permission when asked:
   the script now loads the page from GitHub. The link stays the same.
