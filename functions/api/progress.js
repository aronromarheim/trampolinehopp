// Cloudflare Pages Function: /api/progress
// Lagrer og henter HELE spillerens fremgang (én JSON-blob per bruker), slik at
// progresjonen overlever refresh og følger kontoen på tvers av enheter.
//
//   GET  /api/progress?navn=NAVN   -> { data: {...} | null }
//   POST /api/progress { navn, data } -> { ok: true }
//
// Lagring krever at brukeren finnes i users-tabellen (samme tillitsmodell som
// topplistene: navnet er låst til den innloggede kontoen i klienten).

const NAVN_MAKS = 14;        // samme grense som users/scores bruker
const MAKS_BYTES = 60000;    // tak på størrelsen vi lagrer per bruker

function svar(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
const feil = (melding, status = 400) => svar({ error: melding }, status);

export async function onRequestGet({ env, request }) {
  const navn = (new URL(request.url).searchParams.get("navn") || "").trim().slice(0, NAVN_MAKS);
  if (!navn) return feil("mangler navn");

  const rad = await env.DB.prepare("SELECT data FROM progress WHERE navn = ?1").bind(navn).first();
  let data = null;
  if (rad && rad.data) { try { data = JSON.parse(rad.data); } catch { data = null; } }
  return svar({ data });
}

export async function onRequestPost({ env, request }) {
  let body;
  try { body = await request.json(); } catch { return feil("ugyldig json"); }

  const navn = (body && body.navn != null ? String(body.navn) : "").trim().slice(0, NAVN_MAKS);
  if (!navn) return feil("mangler navn");
  if (body.data == null || typeof body.data !== "object") return feil("mangler data");

  const json = JSON.stringify(body.data);
  if (json.length > MAKS_BYTES) return feil("fremgangen er for stor", 413);

  const fins = await env.DB.prepare("SELECT 1 FROM users WHERE navn = ?1").bind(navn).first();
  if (!fins) return feil("ukjent bruker", 404);

  await env.DB.prepare(
    "INSERT INTO progress (navn, data, laget) VALUES (?1, ?2, ?3) " +
    "ON CONFLICT(navn) DO UPDATE SET data = excluded.data, laget = excluded.laget"
  ).bind(navn, json, Date.now()).run();

  return svar({ ok: true });
}
