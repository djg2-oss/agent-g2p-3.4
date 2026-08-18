/**
 * Agent G2P 3.4 host — no API key.
 * POST /run { brief, mode } → tool grounding only.
 */
import { createServer } from "node:http";
import { runAgentTools, G2P_AGENT_MODEL } from "./core/agent-3.4.ts";

const port = Number(process.env.PORT || 8080);

function json(res, code, body) {
  const data = JSON.stringify(body);
  res.writeHead(code, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
  });
  res.end(data);
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "GET,POST,OPTIONS",
    });
    res.end();
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
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      json(res, 400, { ok: false, error: "bad json" });
      return;
    }
    const brief = String(body.brief || body.prompt || "");
    if (!brief.trim()) {
      json(res, 400, { ok: false, error: "brief required" });
      return;
    }
    const run = runAgentTools(brief, body.mode || "auto");
    json(res, 200, { ok: true, needsApiKey: false, run });
    return;
  }
  json(res, 404, { ok: false, error: "not found" });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Agent G2P 3.4 on :${port} — no API key`);
});
