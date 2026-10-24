// Guest list API for the Vercel site, backed by the Upstash Redis database
// connected to the project in Vercel (Storage tab). GET returns the guests,
// POST {"name": "..."} adds one. Each entry is stored as JSON {name, at}.

const KEY = "halloween:guests";
const MAX_NAME_LENGTH = 60;
const MAX_GUESTS = 300;

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function redis(cfg, command) {
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { Authorization: "Bearer " + cfg.token, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || "Database error");
  return data.result;
}

function parseGuests(raw) {
  return raw.map((item) => {
    try { const g = JSON.parse(item); if (g && g.name) return { name: String(g.name), at: g.at || null }; } catch {}
    return { name: String(item), at: null };
  });
}

const reply = (guests) => ({ ok: true, names: guests.map((g) => g.name), guests });

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch { return {}; }
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const cfg = redisConfig();
  if (!cfg) return res.status(503).json({ ok: false, error: "not_configured" });

  try {
    if (req.method === "GET") {
      return res.status(200).json(reply(parseGuests(await redis(cfg, ["LRANGE", KEY, "0", "-1"]))));
    }
    if (req.method === "POST") {
      const name = String(readBody(req).name || "").trim().replace(/\s+/g, " ");
      if (!name) return res.status(400).json({ ok: false, error: "Enter your name." });
      if (name.length > MAX_NAME_LENGTH) return res.status(400).json({ ok: false, error: "Keep your name under 60 characters." });
      const guests = parseGuests(await redis(cfg, ["LRANGE", KEY, "0", "-1"]));
      const already = guests.some((g) => g.name.toLowerCase() === name.toLowerCase());
      if (!already) {
        if (guests.length >= MAX_GUESTS) return res.status(400).json({ ok: false, error: "The guest list is full." });
        const entry = { name, at: new Date().toISOString() };
        await redis(cfg, ["RPUSH", KEY, JSON.stringify(entry)]);
        guests.push(entry);
      }
      return res.status(200).json(reply(guests));
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (err) {
    return res.status(502).json({ ok: false, error: "Couldn't reach the guest list. Try again." });
  }
};
