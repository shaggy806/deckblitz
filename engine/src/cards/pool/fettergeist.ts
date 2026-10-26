import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 31868.
//
// Rulings:
//   [2012-05-01] The amount of mana you need to pay is determined when the triggered ability
//     resolves.
//
// Esper Sentinel's `payGeneric`, read as the trigger resolves: {1} for each
// other creature you control (each token of a stack counting).

const TEXT =
  "At the beginning of your upkeep, sacrifice this creature unless you pay {1} for each other creature you control.";

export default defineCard({
  name: "Fettergeist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [
          {
            payGeneric: { countOf: { type: "creature", controlledBy: "you" }, excludeSelf: true },
            text: "Pay {X}, where X is the number of other creatures you control.",
          },
        ],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
