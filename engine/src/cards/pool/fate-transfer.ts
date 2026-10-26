import { defineCard } from "../define.js";

// Rulings: every kind of counter moves; if either target is illegal as it resolves, nothing
// moves (rule 122.5 — move-counters does neither half when one end is gone).

export default defineCard({
  name: "Fate Transfer",
  manaCost: "{1}{U/B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Move all counters from target creature onto another target creature.",
  targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 } }],
  effect: { kind: "move-counters", from: 0, to: 1, amount: "all" },
});
