import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 22329.
//
// Rulings:
//   [2004-10-04] The sacrifice is a triggered ability and not a cost.
//   [2008-10-01] When Kjeldoran Dead's "enters" ability resolves, if you don't control any other
//     creatures, you must sacrifice Kjeldoran Dead itself.

const ENTER_TEXT = "When this creature enters, sacrifice a creature.";

export default defineCard({
  name: "Kjeldoran Dead",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 3,
  toughness: 1,
  text: `${ENTER_TEXT}\n{B}: Regenerate this creature.`,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
