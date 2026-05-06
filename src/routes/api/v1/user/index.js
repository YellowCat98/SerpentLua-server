import { entry as status } from "./status.js"

const routes = [
	{ path: "/api/v1/user/status", method: "GET", handler: status }
];

export function entry(request, env, ctx) {
	const { pathname } = new URL(request.url);

	const route = routes.find(r => pathname.startsWith(r.path));

	if (!route) return new Response("Nothing but us chickens!", { status: 404 });
	if (request.method !== route.method) return new Response("Method not allowed.", { status: 405 });

	return route.handler(request, env, ctx);
}