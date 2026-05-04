// a simple helper for authenticating session

export async function getSession(request, env) {
	const session_token = request.headers.get("Authorization");
	if (!session_token) return [null, new Response("Unauthorized", { status: 401 })];

	const session = await env.DB.prepare(`
		SELECT s.account_id, s.expires_at, r.status
		FROM sessions s
		LEFT JOIN user_status r ON s.account_id = r.account_id
		WHERE s.token = ?
	`).bind(session_token).first();

	if (!session) return [null, new Response("Unauthorized", { status: 401 })];
	if (session.expires_at < Math.floor(Date.now() / 1000)) {
		await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(session_token).run();
		return [null, new Response("Session expired", { status: 401 })];
	}

	return [session, null];
}

export async function getStatus(account_id, env) {
	const row = await env.DB.prepare(`
		SELECT status, ban_reason FROM user_status WHERE account_id = ?
	`).bind(account_id).first();

	if (!row) return null;

	return {
		status: row.status,
		ban_reason: row.ban_reason ?? null
	}
}