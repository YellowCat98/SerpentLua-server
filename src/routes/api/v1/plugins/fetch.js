
// url/api/v1/plugin/fetch
// gets a plugin by id
async function single(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams;

	if (!params.get("id")) return new Response("Missing query parameter `id`.", { status: 400 });

	const plugin = await env.DB.prepare("SELECT * from plugins WHERE id = ?1")
		.bind(params.get("id"))
		.first();
	
	plugin.featured = !!plugin.featured;

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

const sorts = {
	most_recent: "last_update_date",
	most_downloaded: "download_count"
};

const statuses = {
	approved: "approved",
	rejected: "rejected",
	pending: "pending"
};

// url/api/v1/fetch/bulk
// returns a bunch of plugins
async function bulk(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams;

	let output = []

	let sort = params.get("sort");
	if (!sort) return new Response("Invalid sort.", { status: 400 });
	sort = sorts[sort];
	if (!sort) return new Response("Invalid sort.", { status: 400 });

	let featured = params.get("featured");
	if (!featured) featured = 0;
	else featured = parseInt(featured);

	const featuredClause = featured ? "AND featured = ?" : "";
	

	let status = params.get("status");
	if (!status) status = "approved";
	status = statuses[status];
	if (!status) status = "approved";

	let page = params.get("page");
	if (page) {
		page = parseInt(page);
		if (isNaN(page)) return new Response("page is NaN.", { status: 400 });

		const perPage = 10;
		
		const offset = (page - 1) * 10;
		const binds = featured ? [status, featured, offset] : [status, offset];
		const { results } = await env.DB.prepare(`
			SELECT * FROM plugins WHERE status = ? ${featuredClause}
			ORDER BY ${sort} DESC
			limit 10 OFFSET ?
		`).bind(...binds).all();

		output = results;
	} else {
		let ids = params.get("ids");
		if (!ids) return new Response("Missing params.", { status: 400 });
		ids = ids.split(",").filter(s => s.length > 0).map(s => s.trim());
		if (ids.length >= 20) return new Response("Too many IDs.", { status: 400 });

		const placeholders = ids.map(() => "?").join(",");

		const binds = featured ? [...ids, status, featured] : [...ids, status];
		const { results } = await env.DB.prepare(`
			SELECT * FROM plugins WHERE id IN (${placeholders}) AND status = ? ${featuredClause}
			ORDER BY ${sort} DESC
		`).bind(...binds).all();

		output = results
	}

	return new Response(
		JSON.stringify(output),
		{
			headers: { "Content-Type": "application/json" }
		}
	);
}

export async function entry(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams;

	if (url.pathname.startsWith("/api/v1/plugin/fetch/bulk")) {
		return bulk(request, env, ctx);
	} else {
		return single(request, env, ctx);
	}
}