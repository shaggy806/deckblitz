import { defineCard } from "../define.js";

// Scry 0 isn't a scry: no "whenever you scry" trigger (rule 701.22b, the ruling).
export default defineCard({
  name: "Ugin's Insight",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Scry X, where X is the greatest mana value among permanents you control, then draw three cards.",
  targets: [],
  effect: {
    kind: "scry",
    amount: { aggregate: "max", of: "mana-value", filter: { controlledBy: "you" } },
    then: { kind: "draw", amount: 3 },
  },
});
