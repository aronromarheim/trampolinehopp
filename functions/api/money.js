// Cloudflare Pages Function: /api/money
// GET  -> topp 10 rikeste
// POST -> lagre penger {navn, penger}; beholder MEST per navn

function topp(env) {
  return env.DB.prepare(
    "SELECT navn, penger FROM money ORDER BY penger DESC, laget ASC LIMIT 10"
  ).all();
}

export async function onRequestGet({ env }) {
  const { results } = await topp(env);
  return Response.json(results ?? []);
}

export async function onRequestPost({ env, request }) {
  let data;
  try { data = await request.json(); } catch { return feil("ugyldig json"); }

  const navn = (data && data.navn != null ? String(data.navn) : "").trim().slice(0, 14);
  let penger = Math.floor(Number(data && data.penger));

  if (!navn) return feil("mangler navn");
  if (!Number.isFinite(penger) || penger < 0) return feil("ugyldig penger");
  if (penger > 1000000000) penger = 1000000000;   // tak mot tull (1 mrd)

  await env.DB.prepare(
    `INSERT INTO money (navn, penger, laget) VALUES (?1, ?2, ?3)
     ON CONFLICT(navn) DO UPDATE SET penger = ?2, laget = ?3 WHERE ?2 > money.penger`
  ).bind(navn, penger, Date.now()).run();

  const { results } = await topp(env);
  return Response.json(results ?? []);
}

// DELETE -> fjern en spiller fra topplisten (kun "aron" får lov)
export async function onRequestDelete({ env, request }) {
  let data;
  try { data = await request.json(); } catch { return feil("ugyldig json"); }

  const av = (data && data.av != null ? String(data.av) : "").trim().toLowerCase();
  if (av !== "aron") return feil("kun aron kan slette", 403);

  const navn = (data && data.navn != null ? String(data.navn) : "").trim().slice(0, 14);
  if (!navn) return feil("mangler navn");

  await env.DB.prepare("DELETE FROM money WHERE navn = ?1").bind(navn).run();

  const { results } = await topp(env);
  return Response.json(results ?? []);
}

function feil(melding, status = 400) {
  return new Response(JSON.stringify({ error: melding }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
