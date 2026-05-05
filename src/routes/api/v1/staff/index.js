import { entry as set_plugin } from "./set_plugin.js"

const routes = [
	{ path: "/api/v1/staff/set_plugin", method: "PATCH", handler: set_plugin }
];

export function entry(request, env, ctx) {
	const { pathname } = new URL(request.url);

	const route = routes.find(r => pathname.startsWith(r.path));

	if (!route) return new Response("Nothing but us chickens!", { status: 404 });
	if (request.method !== route.method) return new Response("Method not allowed.", { status: 405 });

	return route.handler(request, env, ctx);
}