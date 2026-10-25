import { defineCard } from "../define.js";

// EDHREC rank 30612. The life is gained even if the creature isn't destroyed
// (regenerated, indestructible), not if the target is illegal (the rulings).
export default defineCard({
  name: "Surge of Righteousness",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target black or red creature that's attacking or blocking. You gain 2 life.",
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: {
        type: "creature",
        anyOf: [
          { colors: ["B"], attacking: true },
          { colors: ["B"], blocking: true },
          { colors: ["R"], attacking: true },
          { colors: ["R"], blocking: true },
        ],
      },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
