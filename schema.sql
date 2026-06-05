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
