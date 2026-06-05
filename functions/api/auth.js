// Cloudflare Pages Function: /api/auth
// POST { handling: "opprett" | "logginn", navn, passord }
//   opprett  -> lager ny bruker (feiler hvis navnet finnes)
//   logginn  -> sjekker passord mot lagret bruker
// Svar: { ok:true, navn } eller { error: "melding" } med passende statuskode.
//
// Passord lagres ALDRI i klartekst – vi lagrer en PBKDF2-SHA-256-hash med et
// tilfeldig salt per bruker, og regner hashen på nytt ved innlogging.

const ITERASJONER = 100000;
const NAVN_MAKS = 14;        // samme grense som scores-tabellen bruker
const PASSORD_MIN = 4;

function bytesTilHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function hexTilBytes(hex) {
  const ut = new Uint8Array(hex.length / 2);
  for (let i = 0; i < ut.length; i++) ut[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return ut;
}

async function hashPassord(passord, saltBytes) {
  const enc = new TextEncoder();
  const nokkel = await crypto.subtle.importKey(
    "raw", enc.encode(passord), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: ITERASJONER, hash: "SHA-256" },
    nokkel, 256
  );
  return bytesTilHex(new Uint8Array(bits));
}

// Sammenligning som ikke lekker hvor langt to hasher matcher (konstant tid).
function likeHasher(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function svar(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
const feil = (melding, status = 400) => svar({ error: melding }, status);

export async function onRequestPost({ env, request }) {
  let data;
  try { data = await request.json(); } catch { return feil("ugyldig json"); }

  const handling = data && data.handling;
  const navn = (data && data.navn != null ? String(data.navn) : "").trim().slice(0, NAVN_MAKS);
  const passord = data && data.passord != null ? String(data.passord) : "";

  if (!navn) return feil("Skriv et brukernavn.");
  if (passord.length < PASSORD_MIN) return feil("Passordet må ha minst " + PASSORD_MIN + " tegn.");

  if (handling === "opprett") {
    const fins = await env.DB.prepare("SELECT 1 FROM users WHERE navn = ?1").bind(navn).first();
    if (fins) return feil("Brukernavnet er opptatt – velg et annet, eller logg inn.", 409);

    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    const passhash = await hashPassord(passord, saltBytes);
    await env.DB.prepare(
      "INSERT INTO users (navn, passhash, salt, laget) VALUES (?1, ?2, ?3, ?4)"
    ).bind(navn, passhash, bytesTilHex(saltBytes), Date.now()).run();

    return svar({ ok: true, navn });
  }

  if (handling === "logginn") {
    const bruker = await env.DB.prepare(
      "SELECT passhash, salt FROM users WHERE navn = ?1"
    ).bind(navn).first();
    if (!bruker) return feil("Fant ingen bruker med det navnet.", 401);

    const passhash = await hashPassord(passord, hexTilBytes(bruker.salt));
    if (!likeHasher(passhash, bruker.passhash)) return feil("Feil passord.", 401);

    return svar({ ok: true, navn });
  }

  return feil("ukjent handling");
}
