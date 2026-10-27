import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 15300.
//
// Rulings:
//   [2004-12-01] If you control no artifacts, Blinkmoth Infusion costs twelve generic mana and two
//     blue mana to cast.
//   [2004-12-01] Blinkmoth Infusion untaps all artifacts on the battlefield, not just artifacts
//     you control.

export default defineCard({
  name: "Blinkmoth Infusion",
  manaCost: "{12}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  selfCostReduction: affinity({ type: "artifact" }),
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nUntap all artifacts.",
  targets: [],
  effect: { kind: "untap-all", filter: { type: "artifact" } },
});
