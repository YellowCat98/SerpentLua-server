
// url/api/v1/plugin/fetch
// gets a plugin by id
async function single(request, env, ctx) {
	const url = new URL(request.url);
	const params = url.searchParams;

	const id = params.get("id");
	if (id === null) return new Response("Missing query parameter `id`.", { status: 400 });

	const plugin = await env.DB.prepare("SELECT * FROM plugins WHERE id = ?1")
		.bind(id)
		.first();

	if (plugin === null) {
		return new Response(`Plugin of ID "${id}" was not found.`, { status: 404 });
	}
	
	plugin.featured = !!plugin.featured;

	return new Response(
		JSON.stringify(plugin),
		{
			headers: { "Content-Type": "application/json" }
		}
	);
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

	let sort = params.get("sort");
	if (sort === null) return new Response("Invalid sort.", { status: 400 });
	sort = sorts[sort];
	if (sort === null) return new Response("Invalid sort.", { status: 400 });

	let featured = params.get("featured");
	if (featured === null) featured = 0;
	else featured = parseInt(featured);

	const featuredClause = (featured !== null) ? "AND featured = ?" : "";

	let accountID = params.get("account_id");
	const accountClause = (accountID !== null) ? "AND account_id = ?" : "";

	let status = params.get("status");
	if (status !== null) {
		status = statuses[status];
		if (status === undefined) return new Response("Invalid status.", { status: 400 });
	}
	const statusClause = (status !== null) ? "AND status = ?" : "";

	let page = params.get("page");
	if (page !== null) {
		page = parseInt(page);
		if (isNaN(page)) return new Response("page is NaN.", { status: 400 });

		const perPage = 10;
		
		const offset = (page - 1) * 10;
		
		const binds = [];
		if (status !== null) binds.push(status);
		if (featured !== null) binds.push(featured);
		if (accountID !== null) binds.push(accountID);
		binds.push(offset);

		const countBinds = [];
		if (status !== null) countBinds.push(status);
		if (featured !== null) countBinds.push(featured);
		if (accountID !== null) countBinds.push(accountID);

		const [{ results }, countResult] = await Promise.all([
			env.DB.prepare(`
				SELECT * FROM plugins WHERE 1=1 ${statusClause} ${featuredClause} ${accountClause}
				ORDER BY ${sort} DESC
				limit 10 OFFSET ?
			`).bind(...binds).all(),

			env.DB.prepare(`
				SELECT COUNT(*) as count FROM plugins WHERE 1=1 ${statusClause} ${featuredClause} ${accountClause}
			`).bind(...countBinds).first()
		]);

		const total = countResult.count;
		const totalPages = Math.ceil(total / perPage);

		return new Response(JSON.stringify({
			items: results,
			page,
			total,
			total_pages: totalPages,
			has_prev: page > 1,
			has_next: page < totalPages
		}),
		{ headers: { "Content-Type": "application/json" }});
	}

	let ids = params.get("ids");
	if (!ids) return new Response("Missing params.", { status: 400 });
	ids = ids.split(",").filter(s => s.length > 0).map(s => s.trim());
	if (ids.length >= 20) return new Response("Too many IDs.", { status: 400 });

	const placeholders = ids.map(() => "?").join(",");

	const binds = [...ids, status];
	if (featured !== null) binds.push(featured);
	if (accountID !== null) binds.push(accountID);
	
	const { results } = await env.DB.prepare(`
		SELECT * FROM plugins WHERE id IN (${placeholders}) ${statusClause} ${featuredClause} ${accountClause}
		ORDER BY ${sort} DESC
	`).bind(...binds).all();

	return new Response(
		JSON.stringify(results),
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