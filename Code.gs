// Halloween party RSVP (Google Apps Script).
//
// Keeps the guest list in a Google Doc. The site on Vercel calls this script
// as a JSON API (GET ?action=guests, POST {"name": ...}). Opening the script's
// own link still serves the page too, loaded from this GitHub repo.
//
// Every non-empty line below "Guest list" in the doc is one guest, so you can
// also add, fix or delete names straight in the doc. If the script can't open
// DOC_ID (for example it was made in a different Google account), it creates
// its own "Halloween Party — Guest list" doc in the Drive of the account that
// owns this script, and uses that from then on.

const PAGE_URL = "https://raw.githubusercontent.com/Zoockerberg/Halloween-RSVP/main/index.html";
const DOC_ID = "1ZlPKTkY96ehz4gHh3McRzocGNNlZLbNTSPVNuwNR21M";
const DOC_TITLE = "Halloween Party — Guest list";
const MARKER = "Guest list";
const MAX_NAME_LENGTH = 60;
const PAGE_CACHE_SECONDS = 120;

function doGet(e) {
  if (e && e.parameter && e.parameter.action === "guests") return json_(apiCall_(getGuests));
  const cache = CacheService.getScriptCache();
  let html = cache.get("page");
  if (!html) {
    html = UrlFetchApp.fetch(PAGE_URL).getContentText();
    try {
      cache.put("page", html, PAGE_CACHE_SECONDS);
    } catch (err) {
      // Page too big to cache; serve it uncached.
    }
  }
  return HtmlService.createHtmlOutput(html)
    .setTitle("Halloween Party RSVP")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

// JSON API for the standalone site (Vercel): POST {"name": "..."} to RSVP.
function doPost(e) {
  return json_(apiCall_(() => {
    let body = {};
    try {
      body = JSON.parse(e.postData.contents);
    } catch (err) {
      throw new Error("Couldn't read your RSVP. Try again.");
    }
    return rsvp(body.name);
  }));
}

function apiCall_(fn) {
  try {
    return { ok: true, names: fn() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getDoc_() {
  const props = PropertiesService.getScriptProperties();
  for (const id of [props.getProperty("DOC_ID"), DOC_ID]) {
    if (!id) continue;
    try {
      const doc = DocumentApp.openById(id);
      doc.getBody();
      return doc;
    } catch (err) {
      // Not reachable from this account; try the next option.
    }
  }
  const doc = DocumentApp.create(DOC_TITLE);
  const body = doc.getBody();
  body.setText("Halloween Party — Saturday, October 31");
  body.appendParagraph("Guest list (one name per line, you can edit this by hand):");
  props.setProperty("DOC_ID", doc.getId());
  return doc;
}

function getGuests() {
  const names = [];
  let pastMarker = false;
  for (const p of getDoc_().getBody().getParagraphs()) {
    const text = p.getText().trim();
    if (!pastMarker) {
      if (text.startsWith(MARKER)) pastMarker = true;
      continue;
    }
    if (text) names.push(text);
  }
  return names;
}

function rsvp(rawName) {
  const name = String(rawName || "").trim().replace(/\s+/g, " ");
  if (!name) throw new Error("Enter your name.");
  if (name.length > MAX_NAME_LENGTH) throw new Error("Keep your name under 60 characters.");

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getDoc_().getBody().appendParagraph(name);
  } finally {
    lock.releaseLock();
  }
  return getGuests();
}
