import { entry as plugin } from "./plugins/index.js"
import { entry as moderator } from "./moderator/index.js"
import { entry as auth } from "./auth/index.js"
import { entry as user } from "./user/index.js"

export function entry(request, env, ctx) {
	const { pathname } = new URL(request.url);

	if (pathname.startsWith("/api/v1/plugin")) return plugin(request, env, ctx);
	if (pathname.startsWith("/api/v1/moderator")) return moderator(request, env, ctx);
	if (pathname.startsWith("/api/v1/auth")) return auth(request, env, ctx);
	if (pathname.startsWith("/api/v1/user")) return user(request, env, ctx);

	return new Response("Nothing but us chickens!", { status: 404 });
}