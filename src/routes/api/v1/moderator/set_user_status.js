// url/api/v1/moderator/set_user_status
// sets an user's status, staff can only set banned

import * as utils from "./../../../../utils.js"

export async function entry(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams;

	let modify_allowed = [];
	let inserts;
	let bindsStr;
	let binds;

	const [session, err] = await utils.getSession(request, env);
	if (err) return err;

	const user_status = await utils.getStatus(session.account_id, env);

	if (utils.resolveStatus(user_status?.status, "owner")) modify_allowed = utils.ranks; // i might change this in the future to be more lenient idk
	else if (utils.resolveStatus(user_status?.status, "staff")) modify_allowed = ["banned"];
	else return new Response("Forbidden", { status: 403 });


	const account_id = parseInt(params.get("account_id"));
	if (isNaN(account_id)) return new Response("Invalid parameter account_id", { status: 400 });

	if (session.account_id === account_id) return new Response("Cannot modify own status", { status: 403 });

	const target_status = await utils.getStatus(account_id, env);

	if (utils.resolveStatus(target_status?.status, user_status?.status)) return new Response("Cannot modify one of equal status", { status: 403 });


	const status = params.get("status");

	const ban_reason = params.get("ban_reason");
	
	if (ban_reason) {
		if (status !== "banned") return new Response("Ban reason cannot be provided", { status: 400 });
		inserts = "(account_id, status, ban_reason)";
		bindsStr = "(?, ?, ?)";
		binds = [account_id, status, ban_reason];
	} else {
		inserts = "(account_id, status)";
		bindsStr = "(?, ?)";
		binds = [account_id, status];
	}

	if (status === null) {
		await env.DB.prepare(`
			DELETE from user_status WHERE account_id = ?
		`).bind(account_id).run();
	} else {
		if (!modify_allowed.includes(status)) return new Response("Forbidden", { status: 403 });
		await env.DB.prepare(`
			INSERT OR REPLACE INTO user_status ${inserts} VALUES ${bindsStr}
		`).bind(...binds).run();
	}

	return new Response("ok", { status: 200 });
}