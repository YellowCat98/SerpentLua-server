// url/plugin/add
// adds a new entry

export function entry(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams; // using query parameters for this one

	const sex = params.get("sex")
	return new Response(`yoyo: ${sex}`);
}