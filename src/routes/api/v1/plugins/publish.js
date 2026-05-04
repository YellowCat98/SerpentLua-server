// url/plugin/add
// adds a new entry

import * as utils from "./../../../../auth/helper.js"
// lol!

export async function entry(request, env, ctx) {
	const url = new URL(request.url);
	const body = await request.json(); // using query parameters for this one

	const [session, err] = await utils.getSession(request, env);
	if (err) return err;

	const status = await utils.getStatus(session.account_id, env);
	if (status?.status === "banned") return new Response(status.ban_reason, { status: 403 });

	const date = Math.floor(Date.now() / 1000);

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

	const data = {
		name: body.name,
		developer: body.developer,
		version: body.version,
		serpent_version: body.serpent_version,
		description: body.description,
		download_link: body.download_link,
		id: body.id,
		script_example: body.script_example ?? "",
		release_date: date,
		last_update_date: date
	};

	try {
		await env.DB.prepare(`
			INSERT INTO plugins (name, developer, version, serpent_version, description, download_link, id, script_example, release_date, last_update_date)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
		`)
		.bind(...Object.values(data))
		.run();
	} catch (e) {
		if (e.message.includes("UNIQUE constraint failed") || e.message.includes("PRIMARY KEY constraint failed")) {
			return new Response("Another plugin already has this ID.", { status: 409 });
		} else {
			return new Response(`Internal error: ${e.message}`, { status: 500 });
		}
	}

	return new Response(`ok`, { status: 201 });
}