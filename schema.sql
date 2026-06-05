-- Highscore-tabeller for Trampolinehopp (Cloudflare D1)

-- Gjennom tidene: beste score per navn
CREATE TABLE IF NOT EXISTS scores (
  navn   TEXT PRIMARY KEY,   -- spillerens navn (én rad per navn, beste score beholdes)
  grader INTEGER NOT NULL,   -- flest grader spunnet på big air
  laget  INTEGER NOT NULL    -- tidspunkt (ms) for siste oppdatering
);
CREATE INDEX IF NOT EXISTS idx_scores_grader ON scores (grader DESC);

-- Dagens highscore: beste score per navn per dag (norsk tid). Nullstilles "av seg selv"
-- siden vi alltid spør på dagens dato.
CREATE TABLE IF NOT EXISTS daily (
  dag    TEXT NOT NULL,      -- "YYYY-MM-DD" i norsk tid (Europe/Oslo)
  navn   TEXT NOT NULL,
  grader INTEGER NOT NULL,
  laget  INTEGER NOT NULL,
  PRIMARY KEY (dag, navn)    -- én rad per navn per dag
);
CREATE INDEX IF NOT EXISTS idx_daily ON daily (dag, grader DESC);

-- Nivå-toppliste: høyeste nivå per navn
CREATE TABLE IF NOT EXISTS levels (
  navn  TEXT PRIMARY KEY,   -- én rad per navn (høyeste nivå beholdes)
  nivo  INTEGER NOT NULL,
  laget INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_levels ON levels (nivo DESC);

-- Penge-toppliste: mest penger (toppnotering) per navn
CREATE TABLE IF NOT EXISTS money (
  navn   TEXT PRIMARY KEY,  -- én rad per navn (mest penger beholdes)
  penger INTEGER NOT NULL,
  laget  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_money ON money (penger DESC);

-- Kombo-toppliste: lengste kombo per navn
CREATE TABLE IF NOT EXISTS combos (
  navn  TEXT PRIMARY KEY,   -- én rad per navn (lengste kombo beholdes)
  kombo INTEGER NOT NULL,
  laget INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_combos ON combos (kombo DESC);

-- Brukere (innlogging med navn + passord). Passordet lagres aldri i klartekst,
-- bare som PBKDF2-hash med et tilfeldig salt per bruker.
CREATE TABLE IF NOT EXISTS users (
  navn     TEXT PRIMARY KEY,   -- brukernavn (matcher navn i topplistene)
  passhash TEXT NOT NULL,      -- PBKDF2-SHA-256-hash (hex) av passordet
  salt     TEXT NOT NULL,      -- tilfeldig salt (hex), unikt per bruker
  laget    INTEGER NOT NULL    -- opprettet (ms)
);

-- Fremgang: hele spillerens lagrede progresjon som én JSON-blob per bruker
-- (penger, nivå, framgang, eide baner/triks/ranks/merch, rekorder osv.).
-- Slik beholdes alt ved refresh og på tvers av enheter når du er innlogget.
CREATE TABLE IF NOT EXISTS progress (
  navn  TEXT PRIMARY KEY,   -- brukernavn (matcher users.navn)
  data  TEXT NOT NULL,      -- JSON med hele fremgangen
  laget INTEGER NOT NULL    -- sist lagret (ms)
);
