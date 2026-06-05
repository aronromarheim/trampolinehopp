-- Highscore-tabell for Trampolinehopp (Cloudflare D1)
CREATE TABLE IF NOT EXISTS scores (
  navn   TEXT PRIMARY KEY,   -- spillerens navn (én rad per navn, beste score beholdes)
  grader INTEGER NOT NULL,   -- flest grader spunnet på big air
  laget  INTEGER NOT NULL    -- tidspunkt (ms) for siste oppdatering
);
CREATE INDEX IF NOT EXISTS idx_scores_grader ON scores (grader DESC);
