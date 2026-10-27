import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 30723.
//
// Rulings:
//   [2004-10-04] If the target changes color from red to green or green to red between triggering
//     and resolution, the ability still works.
//
// The target filter is "red or green", so a creature that turned from one to
// the other is still a legal target as the ability resolves.

const TEXT = "When this creature enters, put target red or green creature on top of its owner's library.";

export default defineCard({
  name: "Hunting Drake",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["R"] }, { colors: ["G"] }] } }],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: TEXT,
    },
  ],
});
