import { defineCard } from "../define.js";

export default defineCard({
  name: "Suspicious Detonation",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "This spell costs {3} less to cast if you've sacrificed an artifact this turn.\nThis spell can't be countered. (This includes by the ward ability.)\nSuspicious Detonation deals 4 damage to target creature.",
  selfCostReduction: {
    condition: { kind: "turn-history", what: "sacrificed", filter: { type: "artifact" } },
    reduceGeneric: 3,
  },
  cantBeCountered: true,
  targets: ["creature"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
