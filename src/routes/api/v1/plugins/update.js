// url/api/v1/plugin/update
// updates a plugin

import * as utils from "../../../../utils.js"

export async function entry(request, env, ctx) {
	const url = new URL(request.url);
	const body = await request.json();

	const [session, err] = await utils.getSession(request, env);
	if (err) return err;
	
	const status = await utils.getStatus(session.account_id, env);
	if (status?.status === "banned") return new Response(JSON.stringify({
		status: "banned",
		ban_reason: status?.ban_reason
	}), { status: 403 , headers: { "Content-Type": "application/json" }});

	const required = ["name", "developer", "id", "version", "serpent_version", "description", "download_link"];

	const missing = [];
	for (const field of required) {
		if (!body[field]) {
			missing.push(field);
		}
	}

	if (missing.length !== 0) {
		return new Response(`Body is missing keys: ${JSON.stringify(missing)}`, { status: 400 });
	}

	// check ownership and if it exists first
	const plugin = await env.DB.prepare("SELECT * FROM plugins WHERE id = ?").bind(body.id).first();
	if (!plugin) {
		return new Response(`Plugin of ID ${body.id} doesn't exist.`, { status: 404 });
	}

	let access = plugin.account_id === session.account_id;

	if (!access) return new Response("You don't own this plugin.", { status: 403 });

	// we can now proceed with updating

	if (plugin.version === body.version) return new Response("Version must differ from the old one.", { status: 409 });

	const date = Math.floor(Date.now() / 1000);

	const data = {
		name: body.name,
		developer: body.developer,
		version: body.version,
		serpent_version: body.serpent_version,
		description: body.description,
		download_link: body.download_link,
		script_example: body.script_example ?? "",
		last_update_date: date,
		status: utils.resolveStatus(status?.status, "verified") ? "approved" : "pending",
		download_hash: await utils.getDownloadHash(body.download_link),
		script_download_hash: await utils.getDownloadHash(body.script_example) ?? ""
	};

	const fields = Object.keys(data).map(k => `${k} = ?`).join(", ");
	const values = [...Object.values(data), body.id];

	await env.DB.prepare(`
		UPDATE plugins SET ${fields} WHERE id = ?
	`).bind(...values).run();

	return new Response("ok", { status: 200 });
}