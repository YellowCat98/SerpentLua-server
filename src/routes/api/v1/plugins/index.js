import { entry as publish } from "./publish.js"
import { entry as get } from "./fetch.js"
import { entry as update } from "./update.js"
import { entry as download } from "./download.js"

const routes = [
	{ path: "/api/v1/plugin/publish", method: "POST", handler: publish },
	{ path: "/api/v1/plugin/fetch",   method: "GET",  handler: get },
	{ path: "/api/v1/plugin/update", method: "PATCH", handler: update },
	{ path: "/api/v1/plugin/download", method: "GET", handler: download }
];

export function entry(request, env, ctx) {
	const { pathname } = new URL(request.url);

	const route = routes.find(r => pathname.startsWith(r.path));

	if (!route) return new Response("Nothing but us chickens!", { status: 404 });
	if (request.method !== route.method) return new Response("Method not allowed.", { status: 405 });

	return route.handler(request, env, ctx);
}