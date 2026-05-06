CREATE TABLE IF NOT EXISTS sessions (
	token TEXT NOT NULL, -- this is the session token not the actual argon token
	account_id INTEGER PRIMARY KEY,
	created_at INTEGER,
	expires_at INTEGER
);

CREATE TABLE IF NOT EXISTS user_status (
	account_id INTEGER PRIMARY KEY,
	status TEXT NOT NULL
);