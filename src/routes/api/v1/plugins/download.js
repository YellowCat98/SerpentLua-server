// url/api/v1/plugin/download
// returns a github url if the download hash matches the one thats stored
import * as utils from "./../../../../utils.js"

export async function entry(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams;

	const id = params.get("id");
	if (!id) return new Response("Missing parameter `id`", { status: 400 });

	let script = !!parseInt(params.get("script"));


	let link;
	let hash;
	if (!script) {
		link = "download_link";
		hash = "download_hash";
	} else {
		link = "script_example";
		hash = "script_download_hash";
	}

	let allow; // i couldnt think of a good name for whether we allow redirecting or not

	const plugin = await env.DB.prepare(`
		SELECT download_count, ${link}, ${hash} FROM plugins WHERE id = ?
	`).bind(id).first();

	if (!plugin) return new Response(`Plugin ${id} doesn't exist.`, { status: 404 });

	// now we check da hash

	if (!script) {
		const currentHash = plugin.download_hash;
		const newHash = await utils.getDownloadHash(plugin.download_link);

		allow = currentHash === newHash;
	} else {
		const currentHash = plugin.script_download_hash;
		const newHash = await utils.getDownloadHash(plugin.script_example);

		allow = currentHash === newHash;
	}

	if (!allow) {
		return new Response("Hash mismatch", { status: 409 });
	} else {
		if (!script) {
			await env.DB.prepare(`
				UPDATE plugins SET download_count = ? WHERE id = ?
			`).bind(plugin.download_count+1, id).run();

			return Response.redirect(plugin.download_link, 302);
		} else {
			return Response.redirect(plugin.script_example, 302);
		}
	}
}