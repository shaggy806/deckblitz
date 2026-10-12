import { defineCard } from "../define.js";

export default defineCard({
  name: "Epic Downfall",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile target creature with mana value 3 or greater.",
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "gte", n: 3 } } }],
  effect: { kind: "exile", target: 0 },
});
