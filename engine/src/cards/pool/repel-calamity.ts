import { defineCard } from "../define.js";

// EDHREC rank 7123.
export default defineCard({
  name: "Repel Calamity",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target creature with power or toughness 4 or greater.",
  targets: [
    {
      kind: "permanent",
      filter: { type: "creature", anyOf: [{ power: { op: "gte", n: 4 } }, { toughness: { op: "gte", n: 4 } }] },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
