import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 23844.
//
// Rulings:
//   [2004-10-04] You choose a second target only if you choose to pay the Kicker cost.
//   [2004-10-04] You can sacrifice a tapped land.

export default defineCard({
  name: "Rushing River",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Kicker—Sacrifice a land. (You may sacrifice a land in addition to any other costs as you cast this spell.)\nReturn target nonland permanent to its owner's hand. If this spell was kicked, return another target nonland permanent to its owner's hand.",
  targets: ["nonland-permanent"],
  effect: { kind: "return-to-hand", target: 0 },
  kicker: {
    cost: "",
    also: { text: "Sacrifice a land", sacrifice: { filter: { type: "land" }, count: 1 } },
    targets: ["nonland-permanent", { kind: "other", of: "nonland-permanent", than: { slots: [0] } }],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "return-to-hand", target: 0 },
        { kind: "return-to-hand", target: 1 },
      ],
    },
  },
});
