// Cloudflare Pages Function: /api/combos
// GET  -> topp 10 lengste kombo
// POST -> lagre kombo {navn, kombo}; beholder LENGSTE per navn

function topp(env) {
  return env.DB.prepare(
    "SELECT navn, kombo FROM combos ORDER BY kombo DESC, laget ASC LIMIT 10"
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
  let kombo = Math.floor(Number(data && data.kombo));

  if (!navn) return feil("mangler navn");
  if (!Number.isFinite(kombo) || kombo < 1) return feil("ugyldig kombo");
  if (kombo > 1000000) kombo = 1000000;   // tak mot tull

  await env.DB.prepare(
    `INSERT INTO combos (navn, kombo, laget) VALUES (?1, ?2, ?3)
     ON CONFLICT(navn) DO UPDATE SET kombo = ?2, laget = ?3 WHERE ?2 > combos.kombo`
  ).bind(navn, kombo, Date.now()).run();

  const { results } = await topp(env);
  return Response.json(results ?? []);
}

function feil(melding) {
  return new Response(JSON.stringify({ error: melding }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
