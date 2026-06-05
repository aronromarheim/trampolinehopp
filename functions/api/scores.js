// Cloudflare Pages Function: /api/scores
// GET  -> topp 10 highscores (flest grader spunnet på big air)
// POST -> lagre ny score {navn, grader}; beholder den BESTE per navn

function topp(env) {
  return env.DB.prepare(
    "SELECT navn, grader FROM scores ORDER BY grader DESC, laget ASC LIMIT 10"
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
  let grader = Math.floor(Number(data && data.grader));

  if (!navn) return feil("mangler navn");
  if (!Number.isFinite(grader) || grader < 0) return feil("ugyldig grader");
  if (grader > 1000000) grader = 1000000;   // tak mot tull

  // Upsert: lagre bare hvis den nye scoren er bedre enn den lagrede for samme navn
  await env.DB.prepare(
    `INSERT INTO scores (navn, grader, laget) VALUES (?1, ?2, ?3)
     ON CONFLICT(navn) DO UPDATE SET grader = ?2, laget = ?3 WHERE ?2 > scores.grader`
  ).bind(navn, grader, Date.now()).run();

  const { results } = await topp(env);
  return Response.json(results ?? []);
}

function feil(melding) {
  return new Response(JSON.stringify({ error: melding }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
