import { defineCard } from "../define.js";

// EDHREC rank 29569.
// Not an intervening "if": the Ogre check is made as the ability resolves.

const TEXT = "At the beginning of your upkeep, you lose 2 life if you don't control an Ogre.";

export default defineCard({
  name: "Scourge of Numai",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon", "Spirit"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Ogre" }, atLeast: 1 } },
        then: { kind: "lose-life", amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
