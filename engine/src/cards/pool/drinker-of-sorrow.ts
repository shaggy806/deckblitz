import { defineCard } from "../define.js";

// EDHREC rank 13074. Leyline Phantom's trigger: a `deals-damage` with no
// recipient fires once per combat damage event, however many things it hits.
//
// Rulings:
//   [2004-10-04] You only sacrifice one permanent, no matter how many things it deals damage to.

const TEXT = "Whenever this creature deals combat damage, sacrifice a permanent.";

export default defineCard({
  name: "Drinker of Sorrow",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 5,
  toughness: 3,
  text: `This creature can't block.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", combat: true },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: {}, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
