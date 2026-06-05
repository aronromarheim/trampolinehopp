// Cloudflare Pages Function: /api/ranks
// GET  -> { navn: rank, ... }  (rank-tittel per spiller, til visning på topplistene)
// POST -> lagre din nåværende rank {navn, rank} (overskrives alltid)

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT navn, rank FROM ranks").all();
  const kart = {};
  for (const r of (results ?? [])) kart[r.navn] = r.rank;
  return Response.json(kart);
}

export async function onRequestPost({ env, request }) {
  let data;
  try { data = await request.json(); } catch { return feil("ugyldig json"); }

  const navn = (data && data.navn != null ? String(data.navn) : "").trim().slice(0, 14);
  const rank = (data && data.rank != null ? String(data.rank) : "").trim().slice(0, 40);

  if (!navn) return feil("mangler navn");

  await env.DB.prepare(
    `INSERT INTO ranks (navn, rank, laget) VALUES (?1, ?2, ?3)
     ON CONFLICT(navn) DO UPDATE SET rank = ?2, laget = ?3`
  ).bind(navn, rank, Date.now()).run();

  return Response.json({ ok: true });
}

function feil(melding, status = 400) {
  return new Response(JSON.stringify({ error: melding }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
