-- Every adjustment to a policy writes a new version of its annual premium.
-- The current premium is the one with the highest version.
CREATE TABLE policy_premiums (
  policy_id     text NOT NULL,
  version       integer NOT NULL CHECK (version > 0),
  premium_pence integer NOT NULL CHECK (premium_pence > 0),
  PRIMARY KEY (policy_id, version)
);
