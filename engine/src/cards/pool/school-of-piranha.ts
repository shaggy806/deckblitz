import { defineCard } from "../define.js";

// EDHREC rank 30520.
//
// Binding Grasp's upkeep `unless`.
const TEXT = "At the beginning of your upkeep, sacrifice this creature unless you pay {1}{U}.";

export default defineCard({
  name: "School of Piranha",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{1}{U}", text: "Pay {1}{U}." }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
