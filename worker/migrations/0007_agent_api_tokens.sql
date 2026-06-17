-- Long-lived API tokens for agent/MCP access (one active key per user)

CREATE TABLE IF NOT EXISTS agent_api_tokens (
  user_address TEXT PRIMARY KEY,
  token_hash   TEXT NOT NULL,
  token_prefix TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_agent_api_tokens_hash ON agent_api_tokens (token_hash);
