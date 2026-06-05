// Cloudflare Pages Function: /api/scores
// GET  -> { today: [...], allTime: [...] }  (topp 10 hver)
// POST -> lagre ny score {navn, grader}; beholder BESTE per navn (all-time) og per navn per dag (dagens)

// Dagens dato i norsk tid, f.eks. "2026-06-05"
function norskDag() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
}

function toppAllTime(env) {
  return env.DB.prepare(
    "SELECT navn, grader FROM scores ORDER BY grader DESC, laget ASC LIMIT 10"
  ).all();
}
function toppDagens(env, dag) {
  return env.DB.prepare(
    "SELECT navn, grader FROM daily WHERE dag = ?1 ORDER BY grader DESC, laget ASC LIMIT 10"
  ).bind(dag).all();
}

async function beggeLister(env) {
  const dag = norskDag();
  const [allTime, today] = await Promise.all([toppAllTime(env), toppDagens(env, dag)]);
  return { today: today.results ?? [], allTime: allTime.results ?? [] };
}

export async function onRequestGet({ env }) {
  return Response.json(await beggeLister(env));
}

export async function onRequestPost({ env, request }) {
  let data;
  try { data = await request.json(); } catch { return feil("ugyldig json"); }

  const navn = (data && data.navn != null ? String(data.navn) : "").trim().slice(0, 14);
  let grader = Math.floor(Number(data && data.grader));

  if (!navn) return feil("mangler navn");
  if (!Number.isFinite(grader) || grader < 0) return feil("ugyldig grader");
  if (grader > 1000000) grader = 1000000;   // tak mot tull

  const dag = norskDag();
  const naa = Date.now();

  // Upsert i begge tabellene: lagre bare hvis ny score er bedre enn den lagrede
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO scores (navn, grader, laget) VALUES (?1, ?2, ?3)
       ON CONFLICT(navn) DO UPDATE SET grader = ?2, laget = ?3 WHERE ?2 > scores.grader`
    ).bind(navn, grader, naa),
    env.DB.prepare(
      `INSERT INTO daily (dag, navn, grader, laget) VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(dag, navn) DO UPDATE SET grader = ?3, laget = ?4 WHERE ?3 > daily.grader`
    ).bind(dag, navn, grader, naa),
  ]);

  return Response.json(await beggeLister(env));
}

// DELETE -> fjern en spiller fra topplisten (kun "aron" får lov)
export async function onRequestDelete({ env, request }) {
  let data;
  try { data = await request.json(); } catch { return feil("ugyldig json"); }

  const av = (data && data.av != null ? String(data.av) : "").trim().toLowerCase();
  if (av !== "aron") return feil("kun aron kan slette", 403);

  const navn = (data && data.navn != null ? String(data.navn) : "").trim().slice(0, 14);
  if (!navn) return feil("mangler navn");

  await env.DB.batch([
    env.DB.prepare("DELETE FROM scores WHERE navn = ?1").bind(navn),
    env.DB.prepare("DELETE FROM daily WHERE navn = ?1").bind(navn),
  ]);

  return Response.json(await beggeLister(env));
}

function feil(melding, status = 400) {
  return new Response(JSON.stringify({ error: melding }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
