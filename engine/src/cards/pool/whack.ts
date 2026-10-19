import { defineCard } from "../define.js";

// Streets of New Capenna. Ajani's Response's cost reduction.
export default defineCard({
  name: "Whack",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "This spell costs {3} less to cast if it targets a white creature.\nTarget creature gets -4/-4 until end of turn.",
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", colors: ["W"] }, reduceGeneric: 3 },
  effect: { kind: "modify-pt", target: 0, power: -4, toughness: -4, duration: "end-of-turn" },
});
