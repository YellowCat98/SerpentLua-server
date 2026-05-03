// url/plugin
// nothing really
import { entry as add } from "./add.js"
import { entry as get } from "./get.js"

export function entry(request, env, ctx) {

    const { pathname } = new URL(request.url);

    if (pathname.startsWith("/plugin/add")) return add(request, env, ctx);
    if (pathname.startsWith("/plugin/get")) return get(request, env, ctx);

    return new Response("feet", { status: 404 });
}