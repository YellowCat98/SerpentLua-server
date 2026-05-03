import { entry as api } from "./routes/api/index.js"

export default {
    async fetch(request, env, ctx) {
        const { pathname } = new URL(request.url);

        if (pathname.startsWith("/api")) return api(request, env, ctx);

        return new Response("Nothing but us chickens!", { status: 404 });
    }
};