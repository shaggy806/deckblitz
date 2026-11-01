import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 31631.
//
// Rulings:
//   [2004-10-04] You choose a land to return and return it during resolution of the upkeep
//     triggered ability. This means if you have two Waterspout Djinns, they must each return
//     different Islands.
//
const UPKEEP_TEXT =
  "At the beginning of your upkeep, sacrifice this creature unless you return an untapped Island you control to its owner's hand.";

export default defineCard({
  name: "Waterspout Djinn",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [
          {
            returnToHand: { subtype: "Island", controlledBy: "you", tapped: false },
            text: "Return an untapped Island you control to its owner's hand",
          },
        ],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
