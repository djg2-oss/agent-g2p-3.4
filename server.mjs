import { createServer } from "node:http";
import { runAgentTools, G2P_AGENT_MODEL } from "./core/agent-3.4.mjs";

const port = Number(process.env.PORT || 8080);

function send(res, code, body, type = "application/json; charset=utf-8") {
  const data = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(code, {
    "content-type": type,
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  });
  res.end(data);
}

const page = `<!doctype html><html><head><meta charset="utf-8"><title>Agent G2P 3.4</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;background:#0a0a0a;color:#e8d5a3;font:16px/1.45 system-ui;padding:2rem}
h1{color:#f3e6c0}code{color:#c9cdd3}.ok{color:#7dcea0}</style></head>
<body><h1>Agent G2P 3.4</h1>
<p class="ok">Live. 17 tools. No API key.</p>
<p>POST <code>/run</code> { "brief": "...", "mode": "auto" }</p>
<p>GET <code>/health</code></p></body></html>`;

createServer(async (req, res) => {
  if (req.method === "OPTIONS") { send(res, 204, ""); return; }
  const url = new URL(req.url || "/", "http://local");
  if (req.method === "GET" && url.pathname === "/") {
    send(res, 200, page, "text/html; charset=utf-8");
    return;
  }
  if (req.method === "GET" && url.pathname === "/health") {
    const key = String(process.env.grokg2pai || process.env.XAI_API_KEY || "").trim();
    send(res, 200, {
      ok: true,
      name: G2P_AGENT_MODEL.name,
      version: G2P_AGENT_MODEL.version,
      needsApiKey: false,
      keyPresent: key.length > 8,
      keyLooksLikeXai: key.startsWith("xai-"),
      tools: 17,
    });
    return;
  }
  if (req.method === "POST" && url.pathname === "/run") {
    let raw = "";
    for await (const c of req) raw += c;
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch {
      send(res, 400, { ok: false, error: "bad json" });
      return;
    }
    const brief = String(body.brief || body.prompt || "");
    if (!brief.trim()) {
      send(res, 400, { ok: false, error: "brief required" });
      return;
    }
    send(res, 200, {
      ok: true,
      needsApiKey: false,
      run: runAgentTools(brief, body.mode || "auto"),
    });
    return;
  }
  send(res, 404, { ok: false });
}).listen(port, "0.0.0.0", () => {
  console.log("Agent G2P 3.4 ready :" + port);
});
