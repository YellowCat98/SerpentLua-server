import { entry as api } from "./routes/api/index.js"

export default {
    async fetch(request, env, ctx) {
        const { pathname } = new URL(request.url);

        const ip = request.headers.get("CF-Connecting-IP") ?? "127.0.0.1";

        const { success } = await env.RATE_LIMITER.limit({ key: ip });

        if (!success) {
            return new Response("Too Many Requests", { status: 429 });
        }

        if (pathname.startsWith("/api")) return api(request, env, ctx);

        return new Response("Nothing but us chickens!", { status: 404 });
    }
};