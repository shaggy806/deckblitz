import { defineCard } from "../define.js";

export default defineCard({
  name: "Disembowel",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature with mana value X.",
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "eq", n: "x" } } }],
  effect: { kind: "destroy", target: 0 },
});
