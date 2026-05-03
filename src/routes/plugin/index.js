// <url>/plugin
// nothing really
import { entry as add } from "./add.js"

export function entry(request, env, ctx) {

    const { pathname } = new URL(request.url);

    if (pathname.startsWith("/plugin/add")) return add(request, env, ctx);

    return new Response("feet", { status: 404 });
}