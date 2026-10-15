import { defineCard } from "../define.js";

// EDHREC rank 14222.

export default defineCard({
  name: "Kin-Tree Severance",
  manaCost: "{2/W}{2/B}{2/G}",
  colors: ["W", "B", "G"],
  types: ["instant"],
  text: "Exile target permanent with mana value 3 or greater.",
  targets: [{ kind: "permanent", filter: { manaValue: { op: "gte", n: 3 } } }],
  effect: { kind: "exile", target: 0 },
});
