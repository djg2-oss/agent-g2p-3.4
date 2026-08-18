import { createServer } from "node:http";
import { runAgentTools, G2P_AGENT_MODEL } from "./core/agent-3.4.mjs";

const port = Number(process.env.PORT || 8080);

function json(res, code, body) {
  res.writeHead(code, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  });
  res.end(JSON.stringify(body));
}

createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    json(res, 204, {});
    return;
  }
  const url = new URL(req.url || "/", "http://local");
  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
    json(res, 200, {
      ok: true,
      name: G2P_AGENT_MODEL.name,
      version: G2P_AGENT_MODEL.version,
      needsApiKey: false,
      tools: 17,
    });
    return;
  }
  if (req.method === "POST" && url.pathname === "/run") {
    let raw = "";
    for await (const c of req) raw += c;
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch {
      json(res, 400, { ok: false, error: "bad json" });
      return;
    }
    const brief = String(body.brief || body.prompt || "");
    if (!brief.trim()) {
      json(res, 400, { ok: false, error: "brief required" });
      return;
    }
    json(res, 200, { ok: true, needsApiKey: false, run: runAgentTools(brief, body.mode || "auto") });
    return;
  }
  json(res, 404, { ok: false });
}).listen(port, "0.0.0.0", () => {
  console.log("Agent G2P 3.4 — no API key — :" + port);
});
