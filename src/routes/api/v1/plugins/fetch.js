// url/plugin/get
// gets a plugin by id

export async function entry(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams;

	const plugin = await env.DB.prepare("SELECT * from plugins WHERE id = ?1")
		.bind(params.get("id"))
		.first();

	return new Response(
		JSON.stringify(plugin),
		{
			headers: { "Content-Type": "application/json" }
		}
	);
}