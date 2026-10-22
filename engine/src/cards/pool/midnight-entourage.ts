import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 29386.
//
// Rulings:
//   [2017-02-09] Midnight Entourage's triggered ability is mandatory. You draw a card and lose 1
//     life even if you don't want to.
//   [2017-02-09] If Midnight Entourage and another Aetherborn you control die at the same time,
//     its ability triggers once for each of them.

const LORD = "Other Aetherborn you control get +1/+1.";
const DIES = "Whenever this creature or another Aetherborn you control dies, you draw a card and you lose 1 life.";

export default defineCard({
  name: "Midnight Entourage",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Aetherborn", "Rogue"],
  power: 3,
  toughness: 3,
  text: `${LORD}\n${DIES}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Aetherborn", excludeSelf: true },
      grantPt: [1, 1],
      text: LORD,
    },
  ],
  triggered: [
    ...thisOrAnother({
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtype: "Aetherborn" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DIES,
    }),
  ],
});
