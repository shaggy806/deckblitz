import { defineCard } from "../define.js";

// EDHREC rank 22691.
//
// Rulings:
//   [2013-01-24] Mortus Strider will return to its owner's hand only if it is still in the
//     graveyard when its ability resolves.

const TEXT = "When this creature dies, return it to its owner's hand.";

export default defineCard({
  name: "Mortus Strider",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
