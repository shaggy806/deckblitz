import { defineCard } from "../define.js";

// EDHREC rank 27884.
export default defineCard({
  name: "Culling Sun",
  manaCost: "{2}{W}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Destroy each creature with mana value 3 or less.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
});
