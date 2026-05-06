// url/api/v1/user/status
// gets an user's status

export async function entry(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams;

	const account_id = parseInt(params.get("account_id"));
	if (isNaN(account_id)) return new Response("Missing parameter `account_id`", { status: 400 });

	const status = await env.DB.prepare(`
		SELECT * from user_status WHERE account_id = ?
	`).bind(account_id).first();

	if (!status) {
		return new Response(JSON.stringify({
			status: null,
			ban_reason: null
		}), { status: 200, headers: { "Content-Type": "application/json" } });
	} else {
		return new Response(JSON.stringify({
			status: status.status,
			ban_reason: status.ban_reason ?? ""
		}), { status: 200, headers: { "Content-Type": "application/json" } });
	}
}