import { entry as plugin } from "./routes/plugin/index.js"

export default {
    async fetch(request, env, ctx) {
        const { pathname } = new URL(request.url);

        if (pathname.startsWith("/plugin")) return plugin(request, env, ctx);

        return new Response("Nothing but us chickens!", { status: 404 });
    }
};