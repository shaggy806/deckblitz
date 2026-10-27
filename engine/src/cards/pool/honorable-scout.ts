import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 27670.
//
// Rulings:
//   [2004-10-04] If a creature is both black and red, you gain 2 life, not 4.
//
// Kithkin Zealot's shape: `forTarget` reads the count's "you" as the targeted
// opponent, and the `anyOf` counts a black-red creature once.

const TEXT = "When this creature enters, you gain 2 life for each black and/or red creature target opponent controls.";

export default defineCard({
  name: "Honorable Scout",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Scout"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "gain-life",
        amount: {
          countOf: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["B"] }, { colors: ["R"] }] },
          forTarget: 0,
          times: 2,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
