import { entry as plugin } from "./routes/plugin.js"

export default {
    async fetch(request, env, ctx) {
        const { pathname } = new URL(request.url);

        if (pathname === "/plugin") return plugin(request);

        return new Response("Nothing but us chickens!", { status: 404 });
    }
};