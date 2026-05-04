// url/plugin/get
// gets a plugin by id

async function single(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams;

	const plugin = await env.DB.prepare("SELECT * from plugins WHERE id = ?1")
		.bind(params.get("id"))
		.first();

	if (plugin === null) {
		return new Response(`Plugin of ID \"${params.get("id")}\" was not found.`, { status: 404 });
	} else {
		return new Response( // looks way prettier if i wrap this one in else
			JSON.stringify(plugin),
			{
				headers: { "Content-Type": "application/json" }
			}
		);
	}
}

async function bulk(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams;

	return new Response("boo");
}

export async function entry(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams;

	const keys = [...params.keys()];

	if (keys.length === 1 && keys[0] === "id") {
		return single(request, env, ctx);
	} else {
		return bulk(request, env, ctx);
	}
}