import { defineCard } from "../define.js";

export default defineCard({
  name: "Eliminate",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature or planeswalker with mana value 3 or less.",
  targets: [
    {
      kind: "permanent",
      filter: { typesAnyOf: ["creature", "planeswalker"], manaValue: { op: "lte", n: 3 } },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
