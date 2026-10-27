import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, sacrifice this creature unless you pay {1} for each card in your hand.";

export default defineCard({
  name: "Extravagant Spirit",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
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
            payGeneric: { cardsInHand: "you" },
            text: "Pay {X}, where X is the number of cards in your hand.",
          },
        ],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
