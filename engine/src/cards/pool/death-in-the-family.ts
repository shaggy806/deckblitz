import { defineCard } from "../define.js";

export default defineCard({
  name: "Death in the Family",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target creature with mana value 3 or less.",
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
  effect: { kind: "exile", target: 0 },
});
