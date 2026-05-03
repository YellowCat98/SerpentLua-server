// url/plugin/add
// adds a new entry

export async function entry(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams; // using query parameters for this one

	const data = {
		name: params.get("name"),
		developer: params.get("developer"),
		version: params.get("version"),
		serpent_version: params.get("serpent_version"),
		description: params.get("description"),
		download_link: params.get("download_link"),
		id: params.get("id"),
		script_example: params.get("script_example")
	};

	try {
		await env.DB.prepare(`
			INSERT INTO plugins (name, developer, version, serpent_version, description, download_link, id, script_example)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
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

	return new Response(`ok`, { status: 200 });
}