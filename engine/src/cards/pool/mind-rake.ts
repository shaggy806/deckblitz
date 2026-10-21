import { defineCard } from "../define.js";

// Overloaded it targets nothing and every player discards two — the caster
// included (its ruling).
export default defineCard({
  name: "Mind Rake",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards two cards.\nOverload {1}{B} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 2 },
  overload: {
    cost: "{1}{B}",
    effect: { kind: "discard", target: "each-player", amount: 2 },
  },
});
