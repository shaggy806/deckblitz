import { defineCard } from "../define.js";

// Any spell may be targeted; whether mana was spent is checked on resolution
// (its rulings) — mana actually spent, not the mana cost.
export default defineCard({
  name: "Nix",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell if no mana was spent to cast it.",
  targets: ["spell"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { manaSpent: { op: "eq", n: 0 } } },
    then: { kind: "counter", target: 0 },
  },
});
