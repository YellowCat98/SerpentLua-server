import { entry as v1 } from "./v1/index.js"

export function entry(request, env, ctx) {
	const { pathname } = new URL(request.url);

	if (pathname.startsWith("/api/v1")) return v1(request, env, ctx);

	return new Response("Nothing but us chickens!", { status: 404 });
}