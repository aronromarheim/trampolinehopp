// Cloudflare Pages Function: /api/levels
// GET  -> topp 10 høyeste nivå
// POST -> lagre nivå {navn, nivo}; beholder HØYESTE per navn

function topp(env) {
  return env.DB.prepare(
    "SELECT navn, nivo FROM levels ORDER BY nivo DESC, laget ASC LIMIT 10"
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
  let nivo = Math.floor(Number(data && data.nivo));

  if (!navn) return feil("mangler navn");
  if (!Number.isFinite(nivo) || nivo < 1) return feil("ugyldig nivo");
  if (nivo > 100000) nivo = 100000;   // tak mot tull

  await env.DB.prepare(
    `INSERT INTO levels (navn, nivo, laget) VALUES (?1, ?2, ?3)
     ON CONFLICT(navn) DO UPDATE SET nivo = ?2, laget = ?3 WHERE ?2 > levels.nivo`
  ).bind(navn, nivo, Date.now()).run();

  const { results } = await topp(env);
  return Response.json(results ?? []);
}

function feil(melding) {
  return new Response(JSON.stringify({ error: melding }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
