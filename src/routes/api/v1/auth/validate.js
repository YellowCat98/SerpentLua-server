// url/api/v1/auth/validate
// adapted from https://github.com/GlobedGD/argon#usage-server-side

import * as utils from "./../../../../utils.js"

export async function entry(request, env, ctx) {
	const url = new URL(request.url);
	const body = await request.json();

	if (!body.account_id || !body.argon_token) return new Response("Missing parameters.", { status: 400 });

	const base_url = "https://argon.globed.dev/v1";

	const res = await fetch(`${base_url}/validation/check?account_id=${body.account_id}&authtoken=${body.argon_token}`);

	if (res.status !== 200) {
		return new Response(`Argon: ${await res.text()} (Code ${res.status})`, { status: 500 });
	}

	const argonBody = await res.json();

	if (!argonBody["valid"]) {
		return new Response(`Argon: Invalid token: ${argonBody["cause"]} (Code ${res.status})`, { status: 200 });
	}

	// super success! i will now create the session

	const date = Math.floor(Date.now() / 1000);

	const data = {
		token: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
		account_id: body.account_id,
		created_at: date,
		expires_at: date + (3 * 60 * 60)
	}

	await env.DB.prepare(`
		INSERT OR REPLACE INTO sessions (token, account_id, created_at, expires_at) VALUES (?, ?, ?, ?)
	`).bind(...Object.values(data)).run();

	return new Response(data.token, { status: 200 }); // probably bad if i just make it return the token like that but eh its needed anyway
}