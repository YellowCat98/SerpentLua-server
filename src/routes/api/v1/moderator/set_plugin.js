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

	if (!(await utils.pluginExists(id, env))) return new Response(`Plugin of ID "${id}" was not found.`, { status: 404 });

	const prev_status = await env.DB.prepare("SELECT * FROM plugins WHERE id = ?").bind(id).first("status");
	const prev_featured = (await env.DB.prepare("SELECT * FROM plugins WHERE id = ?").bind(id).first("featured")) === 1;

	let status = params.get("status");
	if (status === null) status = prev_status;

	if (!["approved", "pending", "rejected"].includes(status)) return new Response("Invalid `status`", { status: 400 });

	let featured = params.get("featured");
	if (featured === null) featured = prev_featured;
	else featured = featured === "1";

	if (status === prev_status && featured === prev_featured) return new Response("ok", { status: 200 });

	await env.DB.prepare(`
		UPDATE plugins SET status = ?, featured = ? WHERE id = ?
	`).bind(status, featured, id).run();

	if (status === "approved") {
		await utils.sendWebhook(await env.DB.prepare(`
			SELECT * FROM plugins WHERE id = ?
		`).bind(id).first(), false, featured ? "⭐ A wild plugin has been featured!" : "✅ A wild plugin has been approved!", env);
	}

	return new Response("ok", { status: 200 });
}