// url/api/v1/plugin/exists
// checks whether a plugin exists or not

export async function entry(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams;

	const id = params.get("id");
	if (id === null) return new Response("Missing query parameter `id`.", { status: 400 });

	const row = await env.DB.prepare(`
		SELECT 1 FROM plugins WHERE id = ? LIMIT 1
	`).bind(id).first();

	const exists = row !== null;

	return new Response(exists ? 1 : 0, { status: 200 });
}