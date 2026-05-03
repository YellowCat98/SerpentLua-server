// url/plugin
// nothing really
import { entry as publish } from "./publish.js"
import { entry as get } from "./get.js"

export function entry(request, env, ctx) {

    const { pathname } = new URL(request.url);

    if (pathname.startsWith("/api/v1/plugin/publish")) return publish(request, env, ctx);
    if (pathname.startsWith("/api/v1/plugin/get")) return get(request, env, ctx);

    return new Response("Nothing but us chickens!", { status: 404 });
}