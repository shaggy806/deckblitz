import { defineCard } from "../define.js";

// EDHREC rank 30590.
//
// Rulings:
//   [2004-10-04] You choose whether to pay or not on resolution. If not, then you sacrifice
//     Drifting Djinn. You can choose to not pay if you no longer control this card on resolution.

const TEXT = "At the beginning of your upkeep, sacrifice this creature unless you pay {1}{U}.";

export default defineCard({
  name: "Drifting Djinn",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  cycling: { cost: "{2}" },
  text: `Flying\n${TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{1}{U}", text: "Pay {1}{U}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
