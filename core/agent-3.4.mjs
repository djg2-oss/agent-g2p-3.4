/** Agent G2P 3.4 — Railway host core. No API key. */
export const G2P_AGENT_MODEL = {
  id: "g2p-agent",
  version: "3.4.0",
  name: "G2P Agent 3.4",
  needsApiKey: false,
};

export const PRIOR_TOOLS_33 = [
  "contract","math","constraints","horizon","code_checklist",
  "success_criteria","stakeholder_map","risk_surface","decision_rule","dependency_graph",
];
export const TOOLS_ADDED_IN_3_4 = [
  "assumption_extract","claim_prelabel","scope_cutter","next_action_slice",
  "anti_hype","metric_baseline","tool_fusion",
];

export function selectAgentTools(prompt, mode = "auto") {
  const t = prompt.toLowerCase();
  const tools = ["contract","constraints","success_criteria","risk_surface","decision_rule","assumption_extract","claim_prelabel","next_action_slice","anti_hype"];
  if (/\d/.test(prompt) && /(\$|%|seat|budget|price|roi|margin|discount)/i.test(t)) tools.push("math","metric_baseline");
  if (/\b(day|week|month|deadline|launch|timeline)\b/i.test(t)) tools.push("horizon");
  if (mode === "engineering" || /\b(code|api|typescript|repo)\b/i.test(t)) tools.push("code_checklist");
  if (mode === "business" || mode === "marketing" || /\b(customer|user|founder)\b/i.test(t)) tools.push("stakeholder_map");
  if (mode === "software_design" || mode === "engineering" || /\b(depend|api|block)\b/i.test(t)) tools.push("dependency_graph");
  if (/\bmvp\b|\bscope\b|\b2 weeks?\b/i.test(t) || mode === "software_design") tools.push("scope_cutter");
  return [...new Set(tools)];
}

function tool(id, summary, lines) {
  return { id, ok: true, version: "3.4", summary, lines };
}

export function runAgentTools(prompt, mode = "auto") {
  const selected = selectAgentTools(prompt, mode);
  const results = [];
  const goal = prompt.split(/[.!?\n]/).map((s) => s.trim()).find((s) => s.length > 20) || prompt.slice(0, 160);
  const makers = {
    contract: () => tool("contract", "Contract L0", ["Goal candidate: " + goal]),
    constraints: () => tool("constraints", "constraints", ["Honor must/never/do-not in the brief"]),
    math: () => tool("math", "math", [/\d/.test(prompt) ? "Use only user-given or computed numbers" : "No safe arithmetic — do not invent figures"]),
    horizon: () => tool("horizon", "horizon", ["7-day and 30-day checkpoints"]),
    code_checklist: () => tool("code_checklist", "eng", ["No secrets in the client", "Types at boundaries"]),
    success_criteria: () => tool("success_criteria", "success", ["Metric + threshold + window"]),
    stakeholder_map: () => tool("stakeholder_map", "stakeholders", ["Who decides, who uses, who blocks"]),
    risk_surface: () => tool("risk_surface", "risk", ["Name the kill risk first"]),
    decision_rule: () => tool("decision_rule", "decision", ["Proceed if X by date D; stop if Y"]),
    dependency_graph: () => tool("dependency_graph", "deps", ["Blockers first"]),
    assumption_extract: () => tool("assumption_extract", "assumptions", ["User-stated vs inferred"]),
    claim_prelabel: () => tool("claim_prelabel", "claims", ["[proven] only if given or computed"]),
    scope_cutter: () => tool("scope_cutter", "scope", ["Smallest shippable that proves the goal"]),
    next_action_slice: () => tool("next_action_slice", "next", ["Verb + object + done-check"]),
    anti_hype: () => tool("anti_hype", "honesty", ["No guaranteed ROI, no fake citations"]),
    metric_baseline: () => tool("metric_baseline", "metrics", ["Baseline known/unknown"]),
  };
  for (const id of selected) if (makers[id]) results.push(makers[id]());
  results.push(tool("tool_fusion", "fusion", ["Fusion over " + results.length + " tools"]));
  const toolsUsed = [...selected, "tool_fusion"];
  return {
    modelId: "g2p-agent",
    modelVersion: "3.4.0",
    needsApiKey: false,
    toolsUsed,
    results,
    contextBlock: results.map((r) => "#### " + r.id + "\n" + r.lines.map((l) => "- " + l).join("\n")).join("\n\n"),
    stats: { toolCount: toolsUsed.length, lineCount: results.reduce((n, r) => n + r.lines.length, 0) },
  };
}
