import worker from "./index";
import type { Env } from "./env";

const LICENSE_ROUTES = new Set([
  "/license/activate", "/license/check-in", "/license/devices",
  "/license/rename-device", "/license/deactivate-device",
]);

export default {
  fetch(request: Request, env: Env): Promise<Response> | Response {
    const path = new URL(request.url).pathname;
    if (request.method === "GET" && path === "/health") {
      return Response.json({ environment: "sandbox", product: "stowgui" }, { headers: { "Cache-Control": "no-store" } });
    }
    if (request.method !== "POST" || !LICENSE_ROUTES.has(path)) {
      return new Response("not found", { status: 404 });
    }
    return worker.fetch(request, env);
  },
} satisfies ExportedHandler<Env>;
