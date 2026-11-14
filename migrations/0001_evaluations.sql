-- Free Website Evaluation: one row per evaluation run. Holds the result (public information about the site),
-- a salted hash of the visitor's IP for rate limiting, and whether they asked for the full report.
-- No names or email addresses are stored here; report requests go through Web3Forms.
CREATE TABLE evaluations (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,          -- milliseconds since 1970
  host TEXT NOT NULL,
  domain TEXT NOT NULL,
  ip_hash TEXT,
  grade TEXT,
  score INTEGER,
  complete INTEGER NOT NULL DEFAULT 0,  -- 1 once the speed test has finished
  speed_started INTEGER NOT NULL DEFAULT 0,
  cached INTEGER NOT NULL DEFAULT 0,    -- 1 when served from a recent evaluation of the same site
  lead_submitted INTEGER NOT NULL DEFAULT 0,
  result TEXT NOT NULL                  -- the EvaluationResult as JSON
);

CREATE INDEX idx_evaluations_host ON evaluations (host, created_at);
CREATE INDEX idx_evaluations_ip ON evaluations (ip_hash, created_at);
CREATE INDEX idx_evaluations_created ON evaluations (created_at);
