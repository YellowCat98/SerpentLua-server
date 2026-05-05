import { entry as plugin } from "./plugins/index.js"
import { entry as staff } from "./staff/index.js"

export function entry(request, env, ctx) {
	const { pathname } = new URL(request.url);

	if (pathname.startsWith("/api/v1/plugin")) return plugin(request, env, ctx);
	if (pathname.startsWith("/api/v1/staff")) return staff(request, env, ctx);

	return new Response("Nothing but us chickens!", { status: 404 });
}