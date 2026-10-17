import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 7973.
//
// Rulings:
//   [2023-06-16] Erkenbrand, Lord of Westfold's triggered ability affects only creatures you
//     control at the time it resolves. Any creatures that come under your control later in the
//     turn won't be affected.

export default defineCard({
  name: "Erkenbrand, Lord of Westfold",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: "Whenever Erkenbrand or another Human you control enters, creatures you control get +1/+0 until end of turn.",
  // Only the creatures you control as it resolves (the ruling) — `modify-pt-all`.
  triggered: thisOrAnother({
    trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Human" } },
    targets: [],
    effect: {
      kind: "modify-pt-all",
      filter: { type: "creature", controlledBy: "you" },
      power: 1,
      toughness: 0,
      duration: "end-of-turn",
    },
    resolve: null,
    text: "Whenever Erkenbrand or another Human you control enters, creatures you control get +1/+0 until end of turn.",
  }),
});
