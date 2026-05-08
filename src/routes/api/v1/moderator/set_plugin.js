// url/api/v1/moderator/update_status
// approves/rejects plugins (and pendings plugins its called flexibility)

import * as utils from "../../../../utils.js"

export async function entry(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams;

	const [session, err] = await utils.getSession(request, env);
	if (err) return err;

	const user_status = await utils.getStatus(session.account_id, env);
	if (!utils.resolveStatus(user_status?.status, "staff")) return new Response("Forbidden", { status: 403 });

	// now we update!

	const id = params.get("id");
	if (id === null) return new Response("Missing parameter `id`", { status: 400 });

	const status = params.get("status");
	if (status === null) return new Response("Missing parameter `status`", { status: 400 });

	if (!["approved", "pending", "rejected"].includes(status)) return new Response("Invalid `status`", { status: 400 });

	let featured = params.get("featured");
	if (featured === null) featured = await env.DB.prepare("SELECT * FROM plugins WHERE id = ?").bind(id).first("featured");

	await env.DB.prepare(`
		UPDATE plugins SET status = ?, featured = ? WHERE id = ?
	`).bind(status, featured, id).run();

	return new Response("ok", { status: 200 });
}