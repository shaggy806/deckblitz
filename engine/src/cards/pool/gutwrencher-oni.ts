import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 25659. Scourge of Numai's Ogre check.

const TEXT = "At the beginning of your upkeep, discard a card if you don't control an Ogre.";

export default defineCard({
  name: "Gutwrencher Oni",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon", "Spirit"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Ogre" }, atLeast: 1 } },
        then: { kind: "discard", target: "you", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
