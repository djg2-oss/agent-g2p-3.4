# Agent G2P 3.4

Your **agent**. **17 tools.** **No API key.**

Not Grok G2P-X. Not a Grok product. Tools only.

## Connect Railway (GitHub)

1. Open https://railway.app/new
2. **Deploy from GitHub**
3. Pick **`djg2-oss/agent-g2p-3.4`**
4. Deploy. **Do not add `XAI_API_KEY`.**

Railway public URL will serve:
- `GET /` status
- `POST /run` `{ "brief", "mode" }` → Agent 3.4 tools

## Optional later

Only add `XAI_API_KEY` if you want **Grok 4.5** to write after the tools. Agent 3.4 itself does not need it.
