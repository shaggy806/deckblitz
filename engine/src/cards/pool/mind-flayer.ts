import { defineCard } from "../define.js";

// EDHREC rank 4628. Master Thief's shape, for a creature.
//
// Rulings:
//   [2021-07-23] If Mind Flayer leaves the battlefield or you lose control of it before its
//     Dominate Monster ability resolves, control of the target creature doesn't change at all.

const TEXT =
  "Dominate Monster — When this creature enters, gain control of target creature for as long as you control this creature.";

export default defineCard({
  name: "Mind Flayer",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
